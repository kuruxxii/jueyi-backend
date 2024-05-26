import "dotenv/config";
import { Request, Response, NextFunction } from "express";
import { UserModel } from "../models/UserModel";
import jwt from "jsonwebtoken";

export const login = async (req: Request, res: Response) => {
  const { email } = req.body;
  try {
    if (!email) {
      throw new Error("Email field must not be empty!");
    }
    const isSubscriber = await UserModel.findOne({ email }).exec();
    if (!isSubscriber) {
      throw new Error("Not subscriber");
    }
    const token = jwt.sign({ email }, process.env.JWT_SECRET as string, {
      expiresIn: "1h",
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
