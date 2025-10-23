use crate::models::{ChatMessage, OpenAISettings};
use actix_web::web;
use futures_util::StreamExt;
use reqwest::Client;
use serde_json::json;
use std::pin::Pin;
use tokio_stream::wrappers::ReceiverStream;

pub async fn stream_chat_completion(
    messages: Vec<ChatMessage>,
    settings: &OpenAISettings,
) -> Pin<Box<dyn futures_util::Stream<Item = Result<web::Bytes, actix_web::Error>> + Send>> {
    let (tx, rx) = tokio::sync::mpsc::channel(100);
    
    tokio::spawn(async move {
        if let Err(e) = stream_openai_response(messages, settings, tx).await {
            log::error!("OpenAI streaming error: {}", e);
        }
    });
    
    Box::pin(ReceiverStream::new(rx).map(|chunk| {
        Ok(web::Bytes::from(chunk))
    }))
}

async fn stream_openai_response(
    messages: Vec<ChatMessage>,
    settings: &OpenAISettings,
    tx: tokio::sync::mpsc::Sender<String>,
) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
    let client = Client::new();
    
    let request_body = json!({
        "model": "deepseek-reasoner",
        "messages": messages,
        "temperature": 0,
        "stream": true
    });
    
    let response = client
        .post(&settings.openai_base_url)
        .header("Authorization", format!("Bearer {}", settings.openai_token))
        .header("Content-Type", "application/json")
        .json(&request_body)
        .send()
        .await?;
    
    if !response.status().is_success() {
        let error_text = response.text().await?;
        return Err(format!("OpenAI API error: {}", error_text).into());
    }
    
    let mut stream = response.bytes_stream();
    
    while let Some(chunk) = stream.next().await {
        let chunk = chunk?;
        let chunk_str = String::from_utf8_lossy(&chunk);
        
        // Process each line in the chunk
        for line in chunk_str.lines() {
            if line.trim().is_empty() || line.trim() == "data: [DONE]" {
                continue;
            }
            
            if line.starts_with("data: ") {
                let json_str = &line[6..]; // Remove "data: " prefix
                
                // Send the line as-is to maintain SSE format
                if let Err(_) = tx.send(format!("data: {}\n\n", json_str)).await {
                    // Receiver dropped, stop processing
                    return Ok(());
                }
            }
        }
    }
    
    // Send completion signal
    let _ = tx.send("data: [DONE]\n\n".to_string()).await;
    
    Ok(())
}
