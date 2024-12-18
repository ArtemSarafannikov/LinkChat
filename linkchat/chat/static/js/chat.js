document.addEventListener("DOMContentLoaded", () => {
    const loader = document.querySelector(".loader");
    const chatList = document.querySelector(".chat-list");
    const chatWindow = document.querySelector(".chat-window");
    const audioPlayer = document.getElementById("audio-player");
    const playPauseBtn = document.getElementById("playPauseBtn");
    const messagesContainer = document.querySelector(".messages");
    const translateButton = document.getElementById('translate-button');
    const apiUrl = 'http://' + window.location.host + '/';
    const defaultAvatarUrl = "https://yt3.googleusercontent.com/WKEMgcDn7rNchoE_q3jBBwyXQC5hmkPL4Q3Pk9d4HTJ8DJuLP-rapuNRYtVsD5TS9dUg8DIBsQ=s160-c-k-c0x00ffffff-no-rj";
    let chatSocket;
    let musicSocket;
    let translateButtonActive = false;
    let currentChatID;
    let currentChatName;

    function sendMessage(chatId) {
        const messageInputDom = document.querySelector('#chat-message-input');
        const message = messageInputDom.value;

        if (message.trim() !== "") {
            chatSocket.send(JSON.stringify({
                'message': message,
                'chat_id': chatId,
            }));
            messageInputDom.value = '';
        }
    }

    // Функция для загрузки чатов
    async function loadChats() {
        try {
            const response = await fetch(apiUrl + 'chat/get_chats/');

            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }

            const chats = await response.json();
            renderChats(chats);
        } catch (error) {
            console.error("Failed to load chats:", error);
            chatList.innerHTML = "<p>Error loading chats. Please try again later.</p>";
        }
    }

    // Функция для отрисовки чатов
    function renderChats(chats) {
        chatList.innerHTML = ""; // Очистить существующий список чатов

        if (chats.length === 0) {
            chatList.innerHTML = "<p>No chats available.</p>";
            return;
        }

        chats.forEach((chat) => {
            const chatItem = document.createElement("div");
            chatItem.classList.add("chat-item");

//            chatItem.innerHTML = `
//                <div class="chat-avatar" style="background-image: url('${chat.avatar || 'default-avatar.png'}');"></div>
//                <div class="chat-details">
//                    <div class="chat-name">${chat.name}</div>
//                    <div class="chat-update">${chat.lastMessage || 'No messages yet'}</div>
//                </div>
//                <div class="chat-time">${chat.time || ''}</div>
//                ${chat.unreadCount ? `<div class="notification-badge">${chat.unreadCount}</div>` : ""}
//            `;
            chatItem.innerHTML = `
                <div class="chat-avatar" style="background-image: url('${defaultAvatarUrl}');"></div>
                <div class="chat-details">
                    <div class="chat-name">${chat.name}</div>
                </div>
            `;

            chatItem.addEventListener("click", () => loadChatHistory(chat.id, chat.name));

            chatList.appendChild(chatItem);
        });
    }

    async function loadChatHistory(chatId, chatName, language = 'original') {
        loader.style.display = "block";
        chatWindow.style.display = "none";

        if (chatSocket) {
            chatSocket.close();
        }
        if (musicSocket) {
            musicSocket.close();
        }
        try {
            const response = await fetch(apiUrl + `chat/history/${chatId}/?language=${language}`);

            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }

            const messages = await response.json();
            renderChatWindow(chatId, messages, chatName);

            chatSocket = new WebSocket(
                'ws://' + window.location.host + '/ws/chat/' + chatId + '/'
            );
            chatSocket.onmessage = function(e) {
                const data = JSON.parse(e.data);
                renderMessage(data);
            }

            document.querySelector('#chat-message-submit').onclick = function(e) {
                sendMessage(chatId);
            };

            document.querySelector('#chat-message-input').addEventListener('keydown', function(e) {
                if (e.key === 'Enter') {  // Если нажата клавиша Enter
                    sendMessage(chatId);
                    e.preventDefault();  // Предотвращаем создание новой строки
                }
            });

            musicSync();
        } catch (error) {
            console.error("Failed to load chat history:", error);
            messagesContainer.innerHTML = "<p>Error loading chat history.</p>";
        }
        chatWindow.style.display = "flex";
        loader.style.display = "none";
        scrollToBottom();
    }

    function renderChatWindow(chatId, messages, chatName, chatAvatar) {
        currentChatID = chatId;
        currentChatName = chatName;
        // Обновляем заголовок чата
        chatWindow.querySelector(".profile-name").textContent = chatName;
//        chatWindow.querySelector(".profile-img").src = chatAvatar || 'default-avatar.png';
        chatWindow.querySelector(".profile-img").src = chatAvatar || defaultAvatarUrl;

        // Очищаем старые сообщения
        messagesContainer.innerHTML = "";

        messages.forEach((msg) => {
            renderMessage(msg);
        });
    }

    function musicSync() {
        playPauseBtn.addEventListener("click", () => {
            if (audioPlayer.paused) {
                audioPlayer.play();
                playPauseBtn.textContent = "❚❚";
            } else {
                audioPlayer.pause();
                playPauseBtn.textContent = "▶";
            }
        });

        audioPlayer.addEventListener("ended", () => {
            playPauseBtn.textContent = "▶";
        });

        const musicSocket = new WebSocket(`ws://${window.location.host}/ws/music-sync/${currentChatID}/`);

        musicSocket.onmessage = function(event) {
            const data = JSON.parse(event.data);
            const action = data.action;

            if (action === 'play') {
                audioPlayer.play();
                playPauseBtn.textContent = "❚❚";
            } else if (action === 'pause') {
                audioPlayer.pause();
                playPauseBtn.textContent = "▶";
            }
        };

        audioPlayer.onplay = function() {
            musicSocket.send(JSON.stringify({
                action: 'play',
                position: audioPlayer.currentTime
            }));
        };

        audioPlayer.onpause = function() {
            musicSocket.send(JSON.stringify({
                action: 'pause'
            }));
        };
    }

    function renderMessage(msg) {
        const messageDiv = document.createElement("div");
        messageDiv.classList.add("message", msg.msg_type);

//            messageDiv.innerHTML = `
//                <p>${msg.text}</p>
//                <span class="time">${msg.time || ""}</span>
//            `;
        messageDiv.innerHTML = `
            <p>${msg.text}</p>
            <span class="time">10:00</span>
        `;
        messagesContainer.appendChild(messageDiv);
        scrollToBottom();
    }

    function scrollToBottom() {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    translateButton.addEventListener('click', () => {
        translateButtonActive = !translateButtonActive;

        // Изменение класса для изменения цвета
        translateButton.classList.toggle('active', translateButtonActive);

        // Отправка запроса на API сервер
        if (translateButtonActive) {
            loadChatHistory(currentChatID, currentChatName, 'ru');
        } else {
            loadChatHistory(currentChatID, currentChatName);
        }
    });

    // Запуск функции загрузки чатов при загрузке страницы
    loadChats();
    chatWindow.style.display = "none";
    loader.style.display = "none";
});
