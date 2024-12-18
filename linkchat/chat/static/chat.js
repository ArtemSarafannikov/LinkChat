let currentLanguage = 'original';
let chatID = 0;

function initChatScript(chat_id, username) {
    const languageSelect = document.querySelector('#language-select');
    chatID = chat_id;

    currentLanguage = languageSelect.value;

    languageSelect.addEventListener('change', (e) => {
        currentLanguage = e.target.value;
        loadHistory();
    });

    const chatSocket = new WebSocket(
        'ws://' + window.location.host + '/ws/chat/' + chatID + '/'
    );

    loadHistory();

    chatSocket.onmessage = function(e) {
        const data = JSON.parse(e.data);
        const chatLog = document.querySelector('#chat-log');
        const messageElement = document.createElement('p');

        const usernameElement = document.createElement('b');
        usernameElement.textContent = data.username;

        messageElement.appendChild(usernameElement)
        messageElement.appendChild(document.createTextNode(`: ${data.message}`));

        chatLog.appendChild(messageElement);
        chatLog.scrollTop = chatLog.scrollHeight;  // Автопрокрутка к последнему сообщению
    };

    chatSocket.onclose = function(e) {
        console.error('Chat socket closed unexpectedly');
    };

    function sendMessage() {
        const messageInputDom = document.querySelector('#chat-message-input');
        const message = messageInputDom.value;

        if (message.trim() !== "") {
            chatSocket.send(JSON.stringify({
                'message': message,
                'username': username,
                'chat_id': chatID,
            }));
            messageInputDom.value = '';
        }
    }

    document.querySelector('#chat-message-submit').onclick = function(e) {
        sendMessage();
    };

    document.querySelector('#chat-message-input').addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {  // Если нажата клавиша Enter
            sendMessage();
            e.preventDefault();  // Предотвращаем создание новой строки
        }
    });
}

function loadHistory() {
    const chatLog = document.querySelector('#chat-log');
    const translateIndicator = document.querySelector('#translate-indicator');

    if (currentLanguage != 'original') {
        translateIndicator.textContent = 'Переводим...';
        translateIndicator.style.display = 'block';
    }

    fetch('/chat/history/' + chatID + '/?language=' + currentLanguage)
        .then(response => response.json())
        .then(data => {
            chatLog.innerHTML = ''
            data.reverse().forEach(message => {
                const messageElement = document.createElement('p');

                const usernameElement = document.createElement('b');
                usernameElement.textContent = message.username;

                messageElement.appendChild(usernameElement)
                messageElement.appendChild(document.createTextNode(`: ${message.text}`));

                chatLog.appendChild(messageElement);
            });
            chatLog.scrollTop = chatLog.scrollHeight;
        })
        .catch(error => {
            console.error('Error loading history: ', error)
            translateIndicator.textContent = 'Ошибка перевода';
        })
        .finally(() => {
            translateIndicator.style.display = 'none';
    });
}