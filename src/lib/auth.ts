import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { getUserByEmail, getUserById } from "@/lib/db";

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: { strategy: "jwt" },
  pages: {
    signIn: "/notebloom-secure-gate-77",
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const email = String(credentials?.email ?? "");
        const password = String(credentials?.password ?? "");
        if (!email || !password) return null;

        const user = await getUserByEmail(email);
        if (!user) return null;


        const valid = await bcrypt.compare(password, user.password_hash);
        if (!valid) return null;

        if (!user.email_verified) return null;

        return {
          id: String(user.id),
          name: user.name,
          email: user.email,
          isAdmin: !!user.is_admin,
        };
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = (user as { id: string }).id;
        token.isAdmin = (user as { isAdmin: boolean }).isAdmin;
      } else if (token.id) {
        // keep isAdmin fresh across the session in case it changes
        const fresh = await getUserById(Number(token.id));
        if (fresh) token.isAdmin = !!fresh.is_admin;

      }
      return token;
    },
    session: async ({ session, token }) => {
      if (session.user) {
        (session.user as { id?: string }).id = token.id as string;
        (session.user as { isAdmin?: boolean }).isAdmin = token.isAdmin as boolean;
      }
      return session;
    },
  },
});
