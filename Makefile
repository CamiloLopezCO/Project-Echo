postgres:
	docker compose up

psql:
	docker compose exec postgres psql -U postgres postgres
