import "dotenv/config";
import { Request, Response } from "express";
import { UserModel } from "../models/UserModel";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import type { User } from "../lib/definitions";

interface JwtPayload {
  email: string;
}

const transporter = nodemailer.createTransport({
  host: "smtp.163.com",
  port: 465,
  secure: true, // Use `true` for port 465, `false` for all other ports
  auth: {
    user: process.env.EMAIL_ADDRESS,
    pass: process.env.EMAIL_PASS,
  },
});

function sendMagicLinkEmail({
  email,
  token,
}: {
  email: string;
  token: string;
}) {
  const mailOptions = {
    from: process.env.EMAIL_ADDRESS, // sender address
    to: email, // list of receivers
    subject: "📚 觉意阅读登录链接 🔗", // Subject line
    html: `<a href="http://localhost:4000/api/auth/verify?token=${token}">点击链接自动跳转登录觉意阅读</a>`, // html body
  };

  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.log(err);
    } else {
      console.log(`Email sent to ${info.response}`);
    }
  });
}

export const login = async (req: Request, res: Response) => {
  const { email } = req.body;
  try {
    if (!email) {
      throw new Error("Email field must not be empty!");
    }
    const isSubscriber = await UserModel.findOne({ email }).exec();
    if (!isSubscriber) {
      return res.status(403).json({ msg: "亲爱的UU，订阅后才可以登录哟～ ♥️" });
    }
    const token = jwt.sign({ email }, process.env.JWT_SECRET as string, {
      expiresIn: "1h",
    });
    sendMagicLinkEmail({ email, token });
    return res.status(200).json({ msg: "请查看您的邮箱获取登录链接～" });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

export const verify = async (req: Request, res: Response) => {
  const { token } = req.query;
  if (!token) {
    return res.status(401).json({ msg: "Token is null" });
  }
  try {
    const { email } = jwt.verify(
      token as string,
      process.env.JWT_SECRET as string
    ) as JwtPayload;
    const user: User | null = await UserModel.findOne({ email }).exec();
    if (user) {
      const newToken = jwt.sign(
        { email: user.email, number: user.number },
        process.env.JWT_SECRET as string,
        {
          expiresIn: "180d",
        }
      );
      res.cookie("jwt", newToken, {
        httpOnly: true,
        secure: true,
        maxAge: 180 * 24 * 60 * 60 * 1000,
      }); // 180 days
      return res.redirect("http://localhost:3000/home/articles");
    } else {
      return res.status(404).json({ msg: "User not found" });
    }
  } catch (error) {
    return res.status(401).json({ error: error.message });
  }
};

export const status = async (req: Request, res: Response) => {
  try {
    const token = req.cookies.jwt;
    if (!token) {
      return res.status(401).json({ msg: "not authenticated" });
    }
    const { email } = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as JwtPayload;
    return res.status(200).json({
      isAuthenticated: true,
      user: { email },
    });
  } catch (error) {
    return res.status(401).send("Invalid Token");
  }
};
