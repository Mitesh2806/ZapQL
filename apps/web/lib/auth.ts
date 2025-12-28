import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@repo/db"; // Importing from your shared package
import * as schema from "@repo/db"; // Import schema for mapping

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg", // Use "pg" for Postgres
    schema: schema, // Pass your Drizzle schema
  }),
  emailAndPassword: {
    enabled: true,
  },
  // Optional: Add Google/GitHub providers here later
  socialProviders: {
        github: { 
            clientId: process.env.GITHUB_CLIENT_ID as string, 
            clientSecret: process.env.GITHUB_CLIENT_SECRET as string, 
        }, 
        google: { 
            clientId: process.env.GOOGLE_CLIENT_ID as string, 
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string, 
        }
    },
});