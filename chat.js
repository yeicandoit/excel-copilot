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
        // 从 excel-viewer.js 获取 Excel 内容
        let excelData = '';
        if (window.getExcelDataAsText) {
            try {
                excelData = await window.getExcelDataAsText();
            } catch (e) {
                console.warn('Failed to get Excel data:', e);
            }
        }
        // 将 Excel 内容加入到 message
        const fullMessage = excelData
            ? `${message}\n\n[Excel内容]:\n${excelData}`
            : message;

        return new Promise((resolve, reject) => {
            chrome.runtime.sendMessage(
                { 
                    type: 'CHAT_MESSAGE',
                    message: fullMessage
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
        let assistantReason = '';

        // Listen for streaming responses
        function onStream(msg, sender, sendResponse) {
            if (msg.type === 'CHAT_STREAM') {
                // 处理 reasoningContent
                if (msg.reasoningContent) {
                    let reasoningDiv = document.getElementById('reasoningContent');
                    if (!reasoningDiv) {
                        reasoningDiv = document.createElement('div');
                        reasoningDiv.id = 'reasoningContent';
                        reasoningDiv.style.background = '#fffbe6';
                        reasoningDiv.style.border = '1px solid #ffe58f';
                        reasoningDiv.style.padding = '8px 12px';
                        reasoningDiv.style.marginBottom = '10px';
                        reasoningDiv.style.borderRadius = '8px';
                        reasoningDiv.style.color = '#ad8b00';
                        chatHistory.parentNode.insertBefore(reasoningDiv, chatHistory);
                    }
                    assistantReason += msg.reasoningContent;
                    reasoningDiv.innerHTML = marked.parse(assistantReason);
                }
                // 处理 assistant 内容
                if (msg.content) {
                    assistantContent += msg.content;
                    assistantDiv.innerHTML = marked.parse(assistantContent);
                    chatHistory.scrollTop = chatHistory.scrollHeight;
                }
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

// 拖动分隔条调整 chat-section 宽度
const resizer = document.getElementById('resizer');
const chatSection = document.getElementById('chatSection');
const mainContainer = document.querySelector('.main-container');
let isResizing = false;

resizer.addEventListener('mousedown', function(e) {
    isResizing = true;
    document.body.style.cursor = 'ew-resize';
});

document.addEventListener('mousemove', function(e) {
    if (!isResizing) return;
    const containerRect = mainContainer.getBoundingClientRect();
    let newWidth = containerRect.right - e.clientX;
    newWidth = Math.max(250, Math.min(800, newWidth));
    chatSection.style.width = newWidth + 'px';
    mainContainer.style.gridTemplateColumns = `1fr auto ${newWidth}px`;
});

document.addEventListener('mouseup', function() {
    isResizing = false;
    document.body.style.cursor = '';
});