import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    // Ensure required environment variables are present
    if (!process.env.GOOGLE_CLIENT_ID) {
      console.error("GOOGLE_CLIENT_ID is not set");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    if (!process.env.NEXTAUTH_URL) {
      console.error("NEXTAUTH_URL is not set");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    const redirectUri = `${process.env.NEXTAUTH_URL}/api/auth/callback/google`;

    console.log("Google OAuth redirect URI:", redirectUri);
    console.log("Google Client ID:", process.env.GOOGLE_CLIENT_ID);

    const googleAuthUrl =
      `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${process.env.GOOGLE_CLIENT_ID}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `response_type=code&` +
      `scope=${encodeURIComponent("openid email profile")}&` +
      `access_type=offline&` +
      `prompt=consent&` +
      `state=google`;

    console.log("Generated Google Auth URL:", googleAuthUrl);

    return NextResponse.redirect(googleAuthUrl);
  } catch (error) {
    console.error("Google signin error:", error);
    return NextResponse.json(
      { error: "Failed to initiate Google signin" },
      { status: 500 }
    );
  }
}
