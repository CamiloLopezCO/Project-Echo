import path from 'path'
import migrations from 'sql-migrations'

migrations.run({
	migrationsDir: path.resolve(import.meta.dirname, 'migrations'),
	user: "postgres",
	adapter: 'pg',
	password: 'password',
	port: 6432
});
