import { defineConfig } from 'drizzle-kit';
export default defineConfig({
	dialect: 'postgresql', // "mysql" | "sqlite" | "postgresql"
	schema: './src/schema.ts',
	out: './drizzle',
	dbCredentials: {
		url: 'postgresql://postgres:postgres@127.0.0.1:54322/postgres'
	}
});
