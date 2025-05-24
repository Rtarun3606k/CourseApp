import { encodeJWT } from "@/utils/JWT";
import { getDatabase } from "@/utils/MongoDB";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";

async function handleRegister(req) {
  // Fixed function name typo
  try {
    const data = await req.formData();
    const email = data.get("email");
    const isGoogleStr = data.get("isGoogle");
    const isGoogle = isGoogleStr === "true" || isGoogleStr === true; // Proper boolean conversion

    // Validate required fields
    if (!email) {
      return NextResponse.json(
        { message: "Email is required" },
        { status: 400 }
      );
    }

    const { Users } = await getDatabase();
    const checkEmail = await Users.findOne({ email: email });

    if (checkEmail) {
      return NextResponse.json(
        { message: "Email already exists" },
        { status: 400 }
      );
    }

    if (isGoogle) {
      const user = await Users.insertOne({
        email: email,
        isGoogle: true,
        imageUrl: data.get("imageUrl"),
        name: data.get("name"),
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLogin: new Date(),
        isActive: true,
        isVerified: true,
      });

      const token = encodeJWT({
        id: user.insertedId,
        email: email,
        isGoogle: true,
        name: data.get("name"),
      });

      const response = NextResponse.json(
        { message: "User created successfully" },
        { status: 200 }
      );

      response.cookies.set({
        name: "auth-token", // Changed from "admin-token" to match middleware
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 4 * 60 * 60, // 4 hours in seconds
      });

      return response;
    }

    // If the user is not Google, create a new user with hashed password
    const password = data.get("password");
    const name = data.get("name");

    // Validate required fields for non-Google registration
    if (!password) {
      return NextResponse.json(
        { message: "Password is required" },
        { status: 400 }
      );
    }

    if (!name) {
      return NextResponse.json(
        { message: "Name is required" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await Users.insertOne({
      email: email,
      isGoogle: false,
      imageUrl: data.get("imageUrl"),
      name: data.get("name"),
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLogin: new Date(),
      isActive: true,
      isVerified: false,
      password: hashedPassword,
    });

    return NextResponse.json(
      { message: "User created successfully", userId: user.insertedId },
      { status: 200 }
    );
  } catch (error) {
    console.error("Registration error:", error);

    // Return more specific error messages for debugging
    if (error.message.includes("AUTH_SECRET")) {
      return NextResponse.json(
        { message: "Server configuration error" },
        { status: 500 }
      );
    }

    if (error.name === "MongoError" || error.name === "MongoServerError") {
      return NextResponse.json({ message: "Database error" }, { status: 500 });
    }

    return NextResponse.json(
      { message: "Error creating user", error: error.message },
      { status: 500 }
    );
  }
}

export const POST = handleRegister;
