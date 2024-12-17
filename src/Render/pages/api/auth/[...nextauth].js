import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export default NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const user = await prisma.user.findUnique({
          where: {
            username: credentials.username,
          },
        });

        if (user && bcrypt.compareSync(credentials.password, user.password)) {
            const { password, ...userWithoutPassword } = user;
            console.log("User without password:", userWithoutPassword); // Add this line
            return userWithoutPassword;
          }else {
          // Returning null indicates invalid credentials
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // If the user object is available (i.e., during sign-in), map your custom properties
      if (user) {
        token.user = {
          id: user.id, // Assuming you have an `id` property
          name: user.username, // Map `username` to `name`
          // Include any other properties you need
        };
      }
      return token;
    },
    async session({ session, token }) {
      // Assign the user properties from the JWT token to the session's user object
      session.user = token.user ? { ...token.user } : session.user;
      return session;
    },
  },
});