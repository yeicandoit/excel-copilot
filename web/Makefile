# Excel Copilot Makefile

.PHONY: help build start stop clean dev-backend dev-frontend test

help: ## 显示帮助信息
	@echo "Excel Copilot - 可用命令:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

build: ## 构建所有服务
	docker-compose build

start: ## 启动所有服务
	docker-compose up -d

stop: ## 停止所有服务
	docker-compose down

restart: stop start ## 重启所有服务

logs: ## 查看所有服务日志
	docker-compose logs -f

logs-backend: ## 查看后端日志
	docker-compose logs -f backend

logs-frontend: ## 查看前端日志
	docker-compose logs -f frontend

clean: ## 清理Docker资源
	docker-compose down -v --rmi all
	docker system prune -f

dev-backend: ## 本地开发后端
	cd backend && cargo run

dev-frontend: ## 本地开发前端
	cd frontend && npm start

install-frontend: ## 安装前端依赖
	cd frontend && npm install

install-backend: ## 安装后端依赖
	cd backend && cargo build

test: ## 运行测试
	cd backend && cargo test
	cd frontend && npm test

format: ## 格式化代码
	cd backend && cargo fmt
	cd frontend && npm run format

lint: ## 代码检查
	cd backend && cargo clippy
	cd frontend && npm run lint

setup: install-backend install-frontend ## 初始化项目依赖

dev: ## 启动开发环境 (需要两个终端)
	@echo "请分别在两个终端运行:"
	@echo "终端1: make dev-backend"
	@echo "终端2: make dev-frontend"
