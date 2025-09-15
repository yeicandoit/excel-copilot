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
    async function sendToBackground(messages) {
        // 从 excel-viewer.js 获取 Excel 内容
        let excelData = '';
        if (window.getExcelDataAsText) {
            try {
                excelData = await window.getExcelDataAsText();
            } catch (e) {
                console.warn('Failed to get Excel data:', e);
            }
        }

        return new Promise((resolve, reject) => {
            chrome.runtime.sendMessage(
                { 
                    type: 'CHAT_MESSAGE',
                    messages: messages,  // 发送消息列表
                    excelData: excelData
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

    // Function to get all messages from current session
    function getAllSessionMessages() {
        const messages = [];
        const messageElements = chatHistory.querySelectorAll('.message');
        
        messageElements.forEach(element => {
            const isUser = element.classList.contains('user-message');
            const content = element.textContent.trim();
            if (content) {
                messages.push({
                    role: isUser ? 'user' : 'assistant',
                    content: content
                });
            }
        });
        
        return messages;
    }

    // Handle send button click
    sendButton.addEventListener('click', async function() {
        const currentMessage = userInput.value.trim();
        if (!currentMessage) return;

        // Add user message to chat
        addMessage(currentMessage, true);
        userInput.value = '';

        // Get all messages from current session
        const sessionMessages = getAllSessionMessages();
        sessionMessages.push({
            role: "user",
            content: currentMessage
        });

        // Show loading/streaming state
        let assistantDiv = null;

        let streaming = true;
        let assistantContent = '';
        let assistantReason = '';
        const timestamp = Date.now();
        const reasoningContainerId = `reasoningContainer-${timestamp}`;
        const reasoningHeaderId = `reasoningHeader-${timestamp}`;
        const reasoningContentId = `reasoningContent-${timestamp}`;
        const reasoningToggleId = `reasoningToggle-${timestamp}`;

        // Listen for streaming responses
        function onStream(msg, sender, sendResponse) {
            if (msg.type === 'CHAT_STREAM') {
                // 处理 reasoningContent
                if (msg.reasoningContent) {
                    let reasoningContainer = document.getElementById(reasoningContainerId);
                    if (!reasoningContainer) {
                        reasoningContainer = document.createElement('div');
                        reasoningContainer.id = reasoningContainerId;
                        reasoningContainer.style.background = '#fffbe6';
                        reasoningContainer.style.border = '1px solid #ffe58f';
                        reasoningContainer.style.padding = '8px 12px';
                        reasoningContainer.style.marginBottom = '10px';
                        reasoningContainer.style.borderRadius = '8px';
                        reasoningContainer.style.color = '#ad8b00';

                        const reasoningHeader = document.createElement('div');
                        reasoningHeader.id = reasoningHeaderId;
                        reasoningHeader.style.cursor = 'pointer';
                        reasoningHeader.style.display = 'flex';
                        reasoningHeader.style.justifyContent = 'space-between';
                        reasoningHeader.innerHTML = `<span>thinking</span><span id="${reasoningToggleId}">^</span>`;

                        const reasoningContent = document.createElement('div');
                        reasoningContent.id = reasoningContentId;
                        reasoningContent.style.marginTop = '8px';

                        reasoningContainer.appendChild(reasoningHeader);
                        reasoningContainer.appendChild(reasoningContent);

                        chatHistory.appendChild(reasoningContainer);
                        chatHistory.scrollTop = chatHistory.scrollHeight;

                        reasoningHeader.addEventListener('click', () => {
                            const content = document.getElementById(reasoningContentId);
                            const toggle = document.getElementById(reasoningToggleId);
                            if (content.style.display === 'none') {
                                content.style.display = 'block';
                                toggle.textContent = '^';
                            } else {
                                content.style.display = 'none';
                                toggle.textContent = 'v';
                            }
                        });
                    }
                    const reasoningContentDiv = document.getElementById(reasoningContentId);
                    assistantReason += msg.reasoningContent;
                    reasoningContentDiv.innerHTML = marked.parse(assistantReason);
                }
                // 处理 assistant 内容
                if (msg.content) {
                    if (!assistantDiv) {
                        assistantDiv = addMessage('', false);
                    }
                    assistantContent += msg.content;
                    assistantDiv.innerHTML = marked.parse(assistantContent);
                    chatHistory.scrollTop = chatHistory.scrollHeight;
                }
            } else if (msg.type === 'CHAT_ERROR') {
                streaming = false;
                console.error(msg.error);
                chrome.runtime.onMessage.removeListener(onStream);
            }
        }
        chrome.runtime.onMessage.addListener(onStream);

        try {
            // Get response from background script (starts streaming)
            // 发送当前会话的所有消息
            await sendToBackground(sessionMessages);
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