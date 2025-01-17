.PHONY: dev down build

dev:
	@docker-compose up -d --build
	@docker-compose logs api -f

down:
	@docker-compose down

build:
	@docker build --target dev -t api-js:dev .
	@docker build --target api -t api-js:api .
