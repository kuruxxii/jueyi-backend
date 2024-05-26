import "dotenv/config";
import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

interface JwtPayload {
  email: string;
}

export function ensureAuthenticated(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const token = req.cookies.jwt;
  if (!token) {
    return res.status(403).send("A token is required for authentication");
  }
  try {
    const { email } = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as JwtPayload;
    req.user = { email };
  } catch (err) {
    return res.status(401).send("Invalid Token");
  }
  next();
}
