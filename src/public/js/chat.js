const socket = io();

// Listen for chat history
socket.on('chatHistory', (messages) => {
    messages.forEach((message) => {
        appendMessage(message);
    });
});

// Listen for new messages
socket.on('newMessage', (message) => {
    appendMessage(message);
});

// Append message to chat
function appendMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('flex', message.username === 'You' ? 'ml-auto' : 'mr-auto');
    messageDiv.innerHTML = `
        <div class="bg-blue-500 text-white p-2 rounded-lg max-w-xs">
            <strong>${message.username}:</strong> ${message.message}
        </div>
    `;
    document.getElementById('messages').appendChild(messageDiv);
}

// Handle form submission
document.getElementById('messageForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const messageInput = document.getElementById('messageInput');
    const username = document.getElementById('username').value;

    const messageData = {
        username: username,
        message: messageInput.value,
    };

    socket.emit('sendMessage', messageData);
    messageInput.value = '';
});
