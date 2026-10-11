import jwt from "jsonwebtoken";

export function protect(req, res, next) {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Extract token from 'Bearer <token>'
      token = req.headers.authorization.split(" ")[1];

      // Verify token
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "techcart_secret_key_change_in_production_2026"
      );

      // Attach user payload (id, email) to request object
      req.user = decoded;
      return next();
    } catch (error) {
      console.error("JWT Verification error:", error.message);
      return res.status(401).json({
        success: false,
        message: "Not authorized, invalid or expired token",
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Not authorized, no authorization token provided",
    });
  }
}
