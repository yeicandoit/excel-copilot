import axios from 'axios';

// Use proxy for API requests (configured in setupProxy.js)
// Set REACT_APP_OPENAI_API_URL to relative path like '/v1/chat/completions'
const API_BASE_URL = process.env.REACT_APP_OPENAI_API_URL || '/v1/chat/completions';
const API_KEY = process.env.REACT_APP_OPENAI_API_KEY || '';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

export const sendChatMessage = async (messages, excelData, settings, onStream) => {
  try {
    // Prepare OpenAI API request
    const model = settings?.model || 'Qwen3-30B-A3B';
    const temperature = settings?.temperature;
    const maxTokens = settings?.maxTokens;

    const requestBody = {
      model,
      messages,
      stream: true,
    };

    if (temperature !== undefined) {
      requestBody.temperature = temperature;
    }
    if (maxTokens !== undefined) {
      requestBody.max_tokens = maxTokens;
    }

    // Add Excel data context if available
    if (excelData && excelData.length > 0) {
      // Add system message with Excel data context
      const systemMessage = {
        role: 'system',
        content: `You are an Excel data assistant. The user has provided Excel data. Please help analyze and answer questions about this data.\n\nExcel Data:\n${JSON.stringify(excelData, null, 2)}`
      };
      requestBody.messages = [systemMessage, ...messages];
    }

    const headers = {
      'Content-Type': 'application/json',
    };

    if (API_KEY) {
      headers['Authorization'] = `Bearer ${API_KEY}`;
    }

    // Configure fetch options for proxy requests
    const fetchOptions = {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
      cache: 'no-cache',
    };

    console.log('Sending request to:', API_BASE_URL);
    console.log('Request body:', JSON.stringify(requestBody, null, 2));
    console.log('Request headers:', headers);

    const response = await fetch(API_BASE_URL, fetchOptions);

    console.log('Response status:', response.status, response.statusText);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      let errorText = '';
      try {
        errorText = await response.text();
        console.error('Error response body:', errorText);
      } catch (e) {
        errorText = `Failed to read error response: ${e.message}`;
      }
      const errorMessage = `HTTP error! status: ${response.status}, message: ${errorText}`;
      console.error(errorMessage);
      throw new Error(errorMessage);
    }

    if (!response.body) {
      throw new Error('Response body is null. Server may not support streaming.');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let fullContent = '';

    try {
      while (true) {
        let readResult;
        try {
          readResult = await reader.read();
        } catch (readError) {
          console.error('Error reading stream:', readError);
          throw new Error(`Stream read error: ${readError.message}`);
        }

        const { done, value } = readResult;
        if (done) break;

        try {
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.trim() === '') continue;
            if (line.trim() === 'data: [DONE]') continue;

            try {
              const jsonStr = line.replace(/^data:\s*/, '').trim();
              if (!jsonStr) continue;

              const json = JSON.parse(jsonStr);
              const deltaContent = json.choices?.[0]?.delta?.content;
              // OpenAI API doesn't have reasoning_content in standard responses
              // but we keep the structure for compatibility
              const deltaReasoningContent = json.choices?.[0]?.delta?.reasoning_content;

              // Stream incremental content instead of accumulated content
              if (deltaReasoningContent) {
                // Pass only the delta (incremental) content to onStream
                onStream(null, deltaReasoningContent);
              }

              if (deltaContent) {
                fullContent += deltaContent;
                // Pass only the delta (incremental) content to onStream
                onStream(deltaContent, null);
              }
            } catch (parseError) {
              // Log but continue processing other lines
              console.warn('Error parsing streaming response line:', parseError.message, 'Line:', line);
            }
          }
        } catch (decodeError) {
          console.error('Error decoding stream chunk:', decodeError);
          throw new Error(`Stream decode error: ${decodeError.message}`);
        }
      }
    } finally {
      try {
        reader.releaseLock();
      } catch (e) {
        // Ignore release errors
      }
    }

    return fullContent;
  } catch (error) {
    console.error('Error sending chat message:', error);
    // Provide more detailed error information
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      throw new Error('Network error: Failed to connect to the server. Please check if the server is running and accessible.');
    } else if (error.message.includes('HTTP error')) {
      // Re-throw HTTP errors with original message
      throw error;
    } else {
      throw new Error(`Request failed: ${error.message || 'Unknown error occurred'}`);
    }
  }
};


export default api;
