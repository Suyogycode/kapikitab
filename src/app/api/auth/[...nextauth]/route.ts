import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import connectToDatabase from "@/lib/database";
import User from "@/lib/models/User";
import bcrypt from "bcryptjs";

const handler = NextAuth({
  providers: [
    // 1. GOOGLE AUTHENTICATION
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    
    // 2. EMAIL / PASSWORD AUTHENTICATION
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        await connectToDatabase();
        const user = await User.findOne({ email: credentials.email });

        // If user doesn't exist or signed up with Google previously (no password)
        if (!user || !user.password) {
          throw new Error("Invalid credentials");
        }

        const isPasswordMatch = await bcrypt.compare(credentials.password, user.password);
        if (!isPasswordMatch) {
          throw new Error("Invalid credentials");
        }

        return user;
      }
    })
  ],
  callbacks: {
    // 3. THIS RUNS EVERY TIME A USER LOGS IN
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        await connectToDatabase();
        try {
          const userExists = await User.findOne({ email: user.email });
          
          // If this is a new Google user, save them to our MongoDB
          if (!userExists) {
            await User.create({
              email: user.email,
              name: user.name,
              image: user.image,
              // They haven't set their profile yet, so we leave Kapikitab specific fields to their defaults
            });
          }
          return true;
        } catch (error) {
          console.log("Error checking if user exists: ", error);
          return false;
        }
      }
      // If they used email/password, they are already in the DB from signing up
      return true;
    },
    
    // 4. ATTACH THE MONGODB USER ID TO THE SESSION
    async jwt({ token, user, session, trigger }) {
      if (user) {
        await connectToDatabase();
        const dbUser = await User.findOne({ email: user.email });
        if (dbUser) {
          token.id = dbUser._id.toString();
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        // @ts-ignore - appending custom id to session type
        session.user.id = token.id;
      }
      return session;
    }
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/login', // We will build this custom UI next!
  },
});

export { handler as GET, handler as POST };