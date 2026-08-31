import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    CredentialsProvider({
      name: "Credenciales",
      credentials: {
        email: { label: "Correo", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const business = await prisma.business.findUnique({ where: { email: credentials.email } });
        if (!business) return null;

        const valid = await bcrypt.compare(credentials.password, business.passwordHash);
        if (!valid) return null;

        return { id: business.id, email: business.email, name: business.name };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.businessId = user.id;
      return token;
    },
    async session({ session, token }) {
      if (session.user) session.user.businessId = token.businessId as string;
      return session;
    },
  },
};
