import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

export const sendChatMessage = async (messages, excelData, settings, onStream) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages,
        excelData,
        settings
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let fullContent = '';
    let fullReasoningContent = '';

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
          const content = json.choices?.[0]?.delta?.content;
          const reasoningContent = json.choices?.[0]?.delta?.reasoning_content;

          if (reasoningContent) {
            fullReasoningContent += reasoningContent;
            onStream(fullContent, fullReasoningContent);
          }

          if (content) {
            fullContent += content;
            onStream(fullContent, fullReasoningContent);
          }
        } catch (e) {
          console.error('Error parsing streaming response:', e);
        }
      }
    }

    return fullContent;
  } catch (error) {
    console.error('Error sending chat message:', error);
    throw error;
  }
};


export default api;
