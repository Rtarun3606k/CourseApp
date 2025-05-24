import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    const error = searchParams.get("error");
    const error_description = searchParams.get("error_description");

    console.log("Google OAuth callback received:", {
      code: !!code,
      error,
      error_description,
    });

    if (error) {
      console.error("Google OAuth error:", error, error_description);
      return NextResponse.redirect(
        new URL(`/Login?error=google_auth_failed&details=${error}`, req.url)
      );
    }

    if (!code) {
      console.error("No authorization code received from Google");
      return NextResponse.redirect(new URL("/Login?error=no_code", req.url));
    }

    // Verify environment variables
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      console.error("Missing Google OAuth credentials");
      return NextResponse.redirect(
        new URL("/Login?error=server_config", req.url)
      );
    }

    // Exchange code for tokens
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        code,
        grant_type: "authorization_code",
        redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/callback/google`,
      }),
    });

    const tokens = await tokenResponse.json();

    if (!tokens.access_token) {
      return NextResponse.redirect(
        new URL("/login?error=token_exchange_failed", req.url)
      );
    }

    // Get user info from Google
    const userResponse = await fetch(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: {
          Authorization: `Bearer ${tokens.access_token}`,
        },
      }
    );

    const googleUser = await userResponse.json();

    // Now authenticate/register the user using our unified endpoint
    const formData = new FormData();
    formData.append("email", googleUser.email);
    formData.append("isGoogle", "true");
    formData.append("name", googleUser.name);
    formData.append("imageUrl", googleUser.picture || "");

    const authResponse = await fetch(
      `${process.env.NEXTAUTH_URL}/api/auth-unified`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (authResponse.ok) {
      const authData = await authResponse.json();
      const response = NextResponse.redirect(new URL("/home", req.url));

      // Copy the auth cookie from the auth response
      const cookies = authResponse.headers.get("set-cookie");
      if (cookies) {
        response.headers.set("set-cookie", cookies);
      }

      return response;
    } else {
      return NextResponse.redirect(
        new URL("/login?error=auth_failed", req.url)
      );
    }
  } catch (error) {
    console.error("Google callback error:", error);
    return NextResponse.redirect(
      new URL("/login?error=callback_error", req.url)
    );
  }
}
