postgres:
	docker compose up -d

psql-docker:
	docker compose exec postgres psql -U postgres postgres

psql:
	PGPASSWORD=password psql -h localhost -U postgres

structure:
	tree -I node_modules

seed-data:
	node --experimental-strip-types --no-warnings seed-data.ts
