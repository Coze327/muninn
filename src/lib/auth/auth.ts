import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { authConfig } from "./auth.config";
import { prisma } from "@/lib/db/prisma";

// Import types to extend NextAuth session
import "./auth.types";

/**
 * Full auth configuration with providers
 * This file imports Prisma and runs only in Node.js runtime (not Edge)
 */
export const {
  handlers, // API route handlers (GET, POST)
  signIn, // Server-side sign in function
  signOut, // Server-side sign out function
  auth, // Get session in server components/actions
} = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Validate input exists
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = credentials.email as string;
        const password = credentials.password as string;

        // Find user by email
        const user = await prisma.user.findUnique({
          where: { email },
        });

        // User not found
        if (!user) {
          return null;
        }

        // Verify password
        const passwordMatch = await bcrypt.compare(password, user.passwordHash);

        if (!passwordMatch) {
          return null;
        }

        // Return user object (this becomes the session user)
        return {
          id: user.id,
          email: user.email,
        };
      },
    }),
  ],
});
