// 监听来自popup的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'GET_PAGE_DATA') {
    // 这里可以添加获取页面数据的逻辑
    sendResponse({ data: 'Page data' });
  }
});

// 初始化
console.log('Excel Assistant content script loaded'); 