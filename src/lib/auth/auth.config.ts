import type { NextAuthConfig } from "next-auth";

/**
 * Base auth configuration - Edge Runtime compatible
 * This file must NOT import Prisma or any Node.js-only modules
 * because it's used by the middleware which runs in Edge Runtime.
 *
 * The Credentials provider with database lookup is added in auth.ts
 */
export const authConfig: NextAuthConfig = {
  // Providers are added in auth.ts to keep this file Edge-compatible
  providers: [],

  session: {
    strategy: "jwt", // Use JWT tokens, not database sessions
  },

  pages: {
    signIn: "/login", // Custom login page
  },

  callbacks: {
    // Add user ID to the JWT token
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },

    // Add user ID to the session object
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
};
