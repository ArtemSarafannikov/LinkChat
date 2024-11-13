function initChatScript(chatID, username) {

    const chatSocket = new WebSocket(
        'ws://' + window.location.host + '/ws/chat/' + chatID + '/'
    );

    // Загружаем историю сообщений при загрузке страницы
    fetch('/chat/history/' + chatID)
        .then(response => response.json())
        .then(data => {
        const chatLog = document.querySelector('#chat-log');
        data.reverse().forEach(message => {
            const messageElement = document.createElement('p');

            const usernameElement = document.createElement('b');
            usernameElement.textContent = message.username;

            messageElement.appendChild(usernameElement)
            messageElement.appendChild(document.createTextNode(`: ${message.text}`));

            chatLog.appendChild(messageElement);
        });
        chatLog.scrollTop = chatLog.scrollHeight;  // Прокручиваем вниз
    });

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
            chatSocket.send(JSON.stringify({'message': message, 'username': username, 'chat_id': chatID}));
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