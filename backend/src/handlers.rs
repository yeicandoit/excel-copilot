use actix_web::{web, HttpResponse, Result};

use crate::models::*;
use crate::services::openai_service;

pub async fn chat_handler(
    req: web::Json<ChatRequest>,
) -> Result<HttpResponse> {
    let chat_req = req.into_inner();
    
    // Prepare messages for OpenAI
    let mut messages = chat_req.messages;
    
    // Add system message with Excel data
    let system_message = ChatMessage {
        role: "system".to_string(),
        content: format!(
            "You are an Excel data analysis assistant. Help users understand and analyze their Excel data.\n\
            The Excel data is:\n{}\n\n",
            chat_req.excel_data
        ),
    };
    
    messages.insert(0, system_message);
    
    // Create streaming response
    let stream = openai_service::stream_chat_completion(
        messages,
        &chat_req.settings,
    ).await;
    
    Ok(HttpResponse::Ok()
        .content_type("text/plain; charset=utf-8")
        .streaming(stream))
}


pub async fn health_handler() -> Result<HttpResponse> {
    Ok(HttpResponse::Ok().json(HealthResponse {
        status: "healthy".to_string(),
        message: "Excel Copilot Backend is running".to_string(),
    }))
}
