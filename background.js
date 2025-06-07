// 监听来自content script的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'PROCESS_EXCEL') {
    handleExcelProcessing(request.data)
      .then(sendResponse)
      .catch(error => sendResponse({ error: error.message }));
    return true; // 保持消息通道开放
  } else if (request.type === 'OPEN_EXCEL') {
    // 创建新标签页的 URL
    const viewerUrl = chrome.runtime.getURL('excel-viewer.html');
    const fullUrl = `${viewerUrl}`;
    
    // 在新标签页中打开
    chrome.tabs.create({ url: fullUrl });
    
    sendResponse({ success: true });
  } else if (request.type === 'CHAT_MESSAGE') {
    handleChatMessage(request.message)
      .then(response => sendResponse(response))
      .catch(error => {
        console.error('Error handling chat message:', error);
        sendResponse('Sorry, I encountered an error while processing your request.');
      });
    return true; // Required for async response
  }
});

// 处理Excel数据
async function handleExcelProcessing(data) {
  try {
    // 这里可以添加与Excel数据相关的处理逻辑
    return {
      success: true,
      message: 'Excel data processed successfully'
    };
  } catch (error) {
    throw new Error('Failed to process Excel data: ' + error.message);
  }
}

// 监听插件安装事件
chrome.runtime.onInstalled.addListener(() => {
  console.log('Excel Assistant extension installed');
});

// Function to handle chat messages with OpenAI
async function handleChatMessage(message) {
  try {
    const response = await fetch('https://ai-gateway.vei.volces.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "deepseek-reasoner",
        messages: [
          {
            role: "system",
            content: "You are an Excel data analysis assistant. Help users understand and analyze their Excel data."
          },
          {
            role: "user",
            content: message
          }
        ],
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error('Failed to get response from OpenAI');
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error calling OpenAI:', error);
    throw error;
  }
} 