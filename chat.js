// Chat functionality
document.addEventListener('DOMContentLoaded', function() {
    const chatHistory = document.getElementById('chatHistory');
    const userInput = document.getElementById('userInput');
    const sendButton = document.getElementById('sendMessage');

    // Function to add a message to the chat history
    function addMessage(content, isUser = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isUser ? 'user-message' : 'assistant-message'}`;
        messageDiv.textContent = content;
        chatHistory.appendChild(messageDiv);
        chatHistory.scrollTop = chatHistory.scrollHeight;
        return messageDiv;
    }

    // Function to send message to background script
    async function sendToBackground(message) {
        return new Promise((resolve, reject) => {
            chrome.runtime.sendMessage(
                { 
                    type: 'CHAT_MESSAGE',
                    message: message
                },
                response => {
                    if (chrome.runtime.lastError) {
                        reject(chrome.runtime.lastError);
                    } else {
                        resolve(response);
                    }
                }
            );
        });
    }

    // Handle send button click
    sendButton.addEventListener('click', async function() {
        const message = userInput.value.trim();
        if (!message) return;

        // Add user message to chat
        addMessage(message, true);
        userInput.value = '';

        // Show loading/streaming state
        const assistantDiv = addMessage('', false);

        let streaming = true;
        let assistantContent = '';

        // Listen for streaming responses
        function onStream(msg, sender, sendResponse) {
            if (msg.type === 'CHAT_STREAM') {
                assistantContent += msg.content;
                assistantDiv.textContent = assistantContent;
                chatHistory.scrollTop = chatHistory.scrollHeight;
            } else if (msg.type === 'CHAT_ERROR') {
                streaming = false;
                assistantDiv.textContent = msg.error;
                chrome.runtime.onMessage.removeListener(onStream);
            }
        }
        chrome.runtime.onMessage.addListener(onStream);

        try {
            // Get response from background script (starts streaming)
            await sendToBackground(message);
        } catch (error) {
            streaming = false;
            assistantDiv.textContent = 'Sorry, I encountered an error while processing your request.';
            chrome.runtime.onMessage.removeListener(onStream);
        }
    });

    // Handle Enter key press
    userInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendButton.click();
        }
    });
});