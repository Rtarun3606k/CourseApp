import { encodeJWT } from "@/utils/JWT";
import { getDatabase } from "@/utils/MongoDB";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";

async function handleAuth(req) {
  try {
    const data = await req.formData();
    const email = data.get("email");
    const isGoogleStr = data.get("isGoogle");
    const isGoogle = isGoogleStr === "true" || isGoogleStr === true;
    const password = data.get("password");
    const name = data.get("name");
    const imageUrl = data.get("imageUrl") || "";

    // Validate required fields
    if (!email) {
      return NextResponse.json(
        { message: "Email is required" },
        { status: 400 }
      );
    }

    const { Users } = await getDatabase();
    const existingUser = await Users.findOne({ email: email });

    if (existingUser) {
      // USER EXISTS - LOGIN FLOW

      if (isGoogle) {
        // Google login - just verify it's a Google user
        if (!existingUser.isGoogle) {
          return NextResponse.json(
            {
              message:
                "Email exists with password login. Please use password instead.",
            },
            { status: 400 }
          );
        }

        // Update last login
        await Users.updateOne(
          { email: email },
          { $set: { lastLogin: new Date() } }
        );

        // Generate JWT token
        const token = encodeJWT({
          id: existingUser._id,
          email: existingUser.email,
          isGoogle: true,
          name: existingUser.name,
        });

        const response = NextResponse.json(
          {
            message: "Login successful",
            user: {
              email,
              name: existingUser.name,
              isGoogle: true,
              imageUrl: existingUser.imageUrl,
            },
          },
          { status: 200 }
        );

        response.cookies.set({
          name: "auth-token",
          value: token,
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          path: "/",
          maxAge: 4 * 60 * 60, // 4 hours
        });

        return response;
      } else {
        // Email/Password login
        if (existingUser.isGoogle) {
          return NextResponse.json(
            {
              message:
                "Email exists with Google login. Please use Google sign-in instead.",
            },
            { status: 400 }
          );
        }

        if (!password) {
          return NextResponse.json(
            { message: "Password is required" },
            { status: 400 }
          );
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(
          password,
          existingUser.password
        );
        if (!isValidPassword) {
          return NextResponse.json(
            { message: "Invalid password" },
            { status: 400 }
          );
        }

        // Update last login
        await Users.updateOne(
          { email: email },
          { $set: { lastLogin: new Date() } }
        );

        // Generate JWT token
        const token = encodeJWT({
          id: existingUser._id,
          email: existingUser.email,
          isGoogle: false,
          name: existingUser.name,
        });

        const response = NextResponse.json(
          {
            message: "Login successful",
            user: {
              email,
              name: existingUser.name,
              isGoogle: false,
              imageUrl: existingUser.imageUrl,
            },
          },
          { status: 200 }
        );

        response.cookies.set({
          name: "auth-token",
          value: token,
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          path: "/",
          maxAge: 4 * 60 * 60, // 4 hours
        });

        return response;
      }
    } else {
      // USER DOESN'T EXIST - REGISTRATION FLOW

      if (isGoogle) {
        // Google registration
        if (!name) {
          return NextResponse.json(
            { message: "Name is required for registration" },
            { status: 400 }
          );
        }

        const user = await Users.insertOne({
          email: email,
          isGoogle: true,
          imageUrl: imageUrl,
          name: name,
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
          name: name,
        });

        const response = NextResponse.json(
          {
            message: "Registration successful",
            user: { email, name, isGoogle: true, imageUrl },
          },
          { status: 200 }
        );

        response.cookies.set({
          name: "auth-token",
          value: token,
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          path: "/",
          maxAge: 4 * 60 * 60, // 4 hours
        });

        return response;
      } else {
        // Email/Password registration
        if (!password) {
          return NextResponse.json(
            { message: "Password is required for registration" },
            { status: 400 }
          );
        }

        if (!name) {
          return NextResponse.json(
            { message: "Name is required for registration" },
            { status: 400 }
          );
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await Users.insertOne({
          email: email,
          isGoogle: false,
          imageUrl: imageUrl,
          name: name,
          createdAt: new Date(),
          updatedAt: new Date(),
          lastLogin: new Date(),
          isActive: true,
          isVerified: false,
          password: hashedPassword,
        });

        const token = encodeJWT({
          id: user.insertedId,
          email: email,
          isGoogle: false,
          name: name,
        });

        const response = NextResponse.json(
          {
            message: "Registration successful",
            user: { email, name, isGoogle: false, imageUrl },
          },
          { status: 200 }
        );

        response.cookies.set({
          name: "auth-token",
          value: token,
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          path: "/",
          maxAge: 4 * 60 * 60, // 4 hours
        });

        return response;
      }
    }
  } catch (error) {
    console.error("Auth error:", error);

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
      { message: "Authentication error", error: error.message },
      { status: 500 }
    );
  }
}

export const POST = handleAuth;
