use actix_cors::Cors;
use actix_web::{web, App, HttpServer, Result};
use std::env;

mod handlers;
mod models;
mod services;

use handlers::*;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    env_logger::init();
    
    let port = env::var("PORT")
        .unwrap_or_else(|_| "8080".to_string())
        .parse::<u16>()
        .expect("PORT must be a valid number");

    println!("Starting Excel Copilot Backend on port {}", port);

    HttpServer::new(|| {
        let cors = Cors::default()
            .allow_any_origin()
            .allow_any_method()
            .allow_any_header()
            .max_age(3600);

        App::new()
            .wrap(cors)
            .service(
                web::scope("/api")
                    .route("/chat", web::post().to(chat_handler))
                    .route("/health", web::get().to(health_handler))
            )
    })
    .bind(format!("0.0.0.0:{}", port))?
    .run()
    .await
}
