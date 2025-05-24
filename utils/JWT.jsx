import jwt from "jsonwebtoken";

export const encodeJWT = (payload) => {
  if (!payload || typeof payload !== "object") {
    throw new Error("Invalid payload");
  }

  const secretKey = process.env.AUTH_SECRET;
  if (!secretKey) {
    throw new Error("AUTH_SECRET environment variable is not set");
  }

  const token = jwt.sign(payload, secretKey, { expiresIn: "4h" });
  return token;
};
