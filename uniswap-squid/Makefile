process: migrate
	@node -r dotenv/config lib/processor.js

pairs:
	@node -r dotenv/config lib/pairsProcessor.js

serve:
	@npx squid-graphql-server


migrate:
	@npx squid-typeorm-migration apply


migration:
	@npx squid-typeorm-migration generate


typegen:
	@bash ./typegen.sh


codegen:
	@npx squid-typeorm-codegen


up:
	@docker-compose up -d


down:
	@docker-compose down -v


build:
	@npm run build


.PHONY: process serve migrate migration codegen typegen up down build pairs
