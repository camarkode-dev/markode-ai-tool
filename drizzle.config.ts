 // @ts-ignore: missing type declarations for 'drizzle-kit'
const { defineConfig } = require("drizzle-kit");

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL must be defined");

export default defineConfig({
  schema: "./shared/schema.ts",
  out: "./migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false, 
    },
  },
});
