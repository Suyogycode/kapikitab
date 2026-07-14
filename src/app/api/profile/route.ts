import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import connectToDatabase from "@/lib/database";
import User from "@/lib/models/User";
import type { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token?.email) return new NextResponse("Unauthorized", { status: 401 });

    await connectToDatabase();
    const user = await User.findOne({ email: token.email }).select('-password').lean();
    
    if (!user) return new NextResponse("User not found", { status: 404 });
    return NextResponse.json(user);
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token?.email) return new NextResponse("Unauthorized", { status: 401 });

    const body = await req.json();
    
    // Explicitly prevent updating sensitive fields
    delete body.email;
    delete body.password;

    await connectToDatabase();
    const updatedUser = await User.findOneAndUpdate(
      { email: token.email },
      { $set: body },
      { new: true }
    ).select('-password').lean();

    return NextResponse.json(updatedUser);
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}