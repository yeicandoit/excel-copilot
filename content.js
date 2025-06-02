// 监听来自popup的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'GET_PAGE_DATA') {
    // 这里可以添加获取页面数据的逻辑
    sendResponse({ data: 'Page data' });
  } else if (request.type === 'OPEN_EXCEL') {
    // 将 Excel 数据转换为 base64 字符串
    const base64Data = btoa(String.fromCharCode.apply(null, new Uint8Array(request.excelData)));
    
    // 创建新标签页的 URL
    const viewerUrl = chrome.runtime.getURL('excel-viewer.html');
    const fullUrl = `${viewerUrl}?data=${encodeURIComponent(base64Data)}`;
    
    // 在新标签页中打开
    chrome.tabs.create({ url: fullUrl });
    
    sendResponse({ success: true });
  }
});

// 初始化
console.log('Excel Assistant content script loaded'); 