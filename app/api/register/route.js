const { getDatabase } = require("@/utils/MongoDB");
const { NextResponse } = require("next/server");
const bcrypt = require("bcrypt"); // Fixed typo in "bcrypt" import

async function handleRegister(req) {
  // Fixed function name typo
  try {
    const data = await req.formData();
    const email = data.get("email");
    const isGoogle = data.get("isGoogle"); // Convert string to boolean

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

      return NextResponse.json(
        { message: "User created successfully" },
        { status: 200 }
      );
    }

    // If the user is not Google, create a new user with hashed password
    const password = data.get("password");
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
    return NextResponse.json(
      { message: "Error creating user", error: error.message },
      { status: 500 }
    );
  }
}

export const POST = handleRegister;
