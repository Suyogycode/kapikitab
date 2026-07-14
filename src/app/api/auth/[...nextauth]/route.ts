import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import connectToDatabase from "@/lib/database";
import User from "@/lib/models/User";
import bcrypt from "bcryptjs";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
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
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        await connectToDatabase();
        try {
          const userExists = await User.findOne({ email: user.email });
          
          if (!userExists) {
            await User.create({
              email: user.email,
              name: user.name,
              image: user.image,
            });
          }
          return true;
        } catch (error) {
          console.log("Error checking if user exists: ", error);
          return false;
        }
      }
      return true;
    },
    
    async jwt({ token, user, trigger, session }) {
      // This block ONLY runs on the first login event
      if (user) {
        // 1. If using Credentials, the 'user' object is the MongoDB document directly
        if ((user as any).class) {
          const rawClass = String((user as any).class);
          // Result: "Class 9" -> "9" -> "c9"
          token.classId = 'c' + rawClass.replace('Class ', '').trim();
        }
        
        // 2. If it's still missing (Google Login), fetch from the database
        if (!token.classId && user.email) {
          await connectToDatabase();
          const dbUser = await User.findOne({ email: user.email }).lean();
          
          if (dbUser && dbUser.class) { 
            const rawClass = String(dbUser.class); 
            token.classId = 'c' + rawClass.replace('Class ', '').trim();
          }
        }
      }
      
      // Allow manual updates from the frontend to instantly refresh the token
      if (trigger === "update" && session?.classId) {
        token.classId = session.classId;
      }
      
      return token;
    },
    async session({ session, token }) {
      // Bind the formatted classId to the frontend session
      if (session.user) {
        (session.user as any).classId = token.classId;
      }
      return session;
    }
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/login', 
  },
});

export { handler as GET, handler as POST };