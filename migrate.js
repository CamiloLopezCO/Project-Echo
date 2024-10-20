import path from 'path'
import migrations from 'sql-migrations'

migrations.run({
	migrationsDir: 'migrations',
	user: "postgres",
	password: 'password'
});
