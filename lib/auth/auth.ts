import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import { NextAuthOptions } from "next-auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

const DEFAULT_PROFILE_IMAGE = "/default-profile.jpeg";

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
        GitHubProvider({
            clientId: process.env.GITHUB_CLIENT_ID!,
            clientSecret: process.env.GITHUB_CLIENT_SECRET!,
        }),
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials, req) {
                if (!credentials?.email || !credentials?.password) return null;

                const user = await db.query.users.findFirst({
                    where: eq(users.email, credentials.email),
                });

                // Check if user exists and has a password (credentials user)
                if (!user || !user.passwordHash) return null;

                const isValid = await bcrypt.compare(
                    credentials.password,
                    user.passwordHash
                );

                if (!isValid) return null;

                return {
                    id: user.id,
                    name: user.name ?? "Unnamed User",
                    email: user.email,
                    image: user.image ?? DEFAULT_PROFILE_IMAGE,
                };
            },
        }),
    ],

    session: {
        strategy: "jwt",
    },
    jwt: {
        secret: process.env.NEXTAUTH_SECRET,
    },

    callbacks: {
        async signIn({ user, account }) {
            if (!user?.email) return false;

            if (account?.provider === "google" || account?.provider === "github") {
                try {
                    const existingUser = await db.query.users.findFirst({
                        where: eq(users.email, user.email),
                    });

                    if (!existingUser) {
                        await db.insert(users).values({
                            name: user.name ?? "Unnamed User",
                            email: user.email,
                            passwordHash: null,
                            image: user.image ?? DEFAULT_PROFILE_IMAGE,
                            provider: account.provider,
                            providerAccountId: account.providerAccountId ?? null,
                        });
                        console.log("OAuth user saved to DB:", user.email);
                    } else {
                        console.log("OAuth user already exists:", user.email);
                    }
                } catch (error) {
                    console.error("Error saving OAuth user to DB:", error);
                    return false;
                }
            }

            return true;
        },

        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.email = user.email;
                token.name = user.name;
                token.image = user.image;
            }
            return token;
        },

        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
                session.user.email = token.email as string;
                session.user.name = token.name as string;
                session.user.image = token.image as string;
            }
            return session;
        },
    },

    pages: {
        signIn: "/login",
    },
};