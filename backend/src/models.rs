use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize, Serialize)]
pub struct ChatMessage {
    pub role: String,
    pub content: String,
}

#[derive(Debug, Deserialize)]
pub struct ChatRequest {
    pub messages: Vec<ChatMessage>,
    pub excel_data: String,
    pub settings: OpenAISettings,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct OpenAISettings {
    pub openai_base_url: String,
    pub openai_token: String,
}

#[derive(Debug, Serialize)]
pub struct ChatResponse {
    pub success: bool,
    pub message: String,
}


#[derive(Debug, Serialize)]
pub struct HealthResponse {
    pub status: String,
    pub message: String,
}
