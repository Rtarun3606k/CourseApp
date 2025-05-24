const { getDatabase } = require("@/utils/MongoDB");
const { NextResponse } = require("next/server");
const bcrypt = require("bcrypt");
const { encodeJWT } = require("@/utils/JWT");

async function handelRegistrationAdmin(request) {
  try {
    const data = await request.formData();
    const email = data.get("email");
    const password = data.get("password");
    const name = data.get("name");

    const { Admin } = await getDatabase();
    if (!email || !password) {
      return NextResponse.json(
        { message: "Email, password, are required" },
        { status: 400 }
      );
    }

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: email });
    if (existingAdmin) {
      //login if already exists
      // password check
      const isPasswordValid = await bcrypt.compare(
        password,
        existingAdmin.password
      );
      if (isPasswordValid) {
        // Generate JWT token for existing admin
        const token = encodeJWT({
          id: existingAdmin._id,
          email: existingAdmin.email,
          name: existingAdmin.name,
        });

        const response = NextResponse.json(
          { message: "Login successful" },
          { status: 200 }
        );

        response.cookies.set("auth-token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          path: "/",
          maxAge: 4 * 60 * 60, // 4 hours
        });
        return response;
      } else {
        return NextResponse.json(
          { message: "Admin with this email already exists" },
          { status: 400 }
        );
      }
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new admin
    const newAdmin = {
      email: email,
      password: hashedPassword,
      name: name,
      createdAt: new Date(),
    };
    const result = await Admin.insertOne(newAdmin);

    if (result.acknowledged) {
      const token = encodeJWT({
        id: result.insertedId,
        email: email,
        name: name,
      });

      const response = NextResponse.json(
        { message: "Admin registered successfully" },
        { status: 201 }
      );

      response.cookies.set("auth-token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 4 * 60 * 60, // 4 hours
      });

      return response;
    } else {
      return NextResponse.json(
        { message: "Failed to register admin" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error during admin registration:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export const POST = handelRegistrationAdmin;
