import { DefaultSession } from "next-auth";

// Extend the built-in session types to include user ID
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}
