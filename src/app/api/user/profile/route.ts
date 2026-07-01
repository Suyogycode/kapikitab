import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/database";
import User from "@/lib/models/User";
import { getServerSession } from "next-auth";

export async function POST(req: Request) {
  try {
    // 1. Get the securely logged-in user's session
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // 2. Parse the answers sent from the frontend
    const answers = await req.json();

    // 3. Connect to MongoDB
    await connectToDatabase();

    // 4. Find the user by their email and update their profile with the answers
    await User.findOneAndUpdate(
      { email: session.user.email },
      { $set: answers },
      { new: true } // Returns the updated document
    );

    return NextResponse.json({ message: "Profile updated successfully." }, { status: 200 });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json({ message: "An error occurred." }, { status: 500 });
  }
}