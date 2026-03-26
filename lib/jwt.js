import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Sign JWT
 */
export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: "30d",
  });
}

/**
 * Verify JWT safely
 * - Returns decoded payload if valid
 * - Returns null if invalid / expired
 */
export function verifyToken(token) {
  try {
    if (!token) return null;

    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    // 🔐 Token invalid / expired / malformed
    return null;
  }
}
