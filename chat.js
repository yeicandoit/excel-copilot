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

        // Show loading state
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'message assistant-message';
        loadingDiv.textContent = 'Thinking...';
        chatHistory.appendChild(loadingDiv);

        try {
            // Get response from background script
            const response = await sendToBackground(message);
            
            // Remove loading message
            chatHistory.removeChild(loadingDiv);
            
            // Add assistant response
            addMessage(response);
        } catch (error) {
            console.error('Error:', error);
            // Remove loading message
            chatHistory.removeChild(loadingDiv);
            
            // Show error message
            addMessage('Sorry, I encountered an error while processing your request.');
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