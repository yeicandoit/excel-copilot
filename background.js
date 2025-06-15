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
    handleChatMessage(request.message, sender.tab.id)
      .catch(error => {
        console.error('Error handling chat message:', error);
        chrome.tabs.sendMessage(sender.tab.id, {
          type: 'CHAT_ERROR',
          error: 'Sorry, I encountered an error while processing your request.'
        });
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
async function handleChatMessage(message, tabId) {
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
        temperature: 0,
        stream: true
      })
    });

    if (!response.ok) {
      throw new Error('Failed to get response from OpenAI');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.trim() === '') continue;
        if (line.trim() === 'data: [DONE]') continue;
        
        try {
          const jsonStr = line.replace(/^data:/, '');
          const json = JSON.parse(jsonStr);
          const content = json.choices[0]?.delta?.content;
          const reasoningContent = json.choices[0]?.delta?.reasoning_content;

          if (reasoningContent) {
            chrome.tabs.sendMessage(tabId, {
              type: 'CHAT_STREAM',
              reasoningContent: reasoningContent
            });
          }
          
          if (content) {
            chrome.tabs.sendMessage(tabId, {
              type: 'CHAT_STREAM',
              content: content
            });
          }
        } catch (e) {
          console.error('Error parsing streaming response:', e);
        }
      }
    }
  } catch (error) {
    console.error('Error calling OpenAI:', error);
    throw error;
  }
} 