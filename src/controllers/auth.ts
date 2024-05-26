import "dotenv/config";
import { Request, Response, NextFunction } from "express";
import { UserModel } from "../models/UserModel";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

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
      throw new Error("Not subscriber");
    }
    const token = jwt.sign({ email }, process.env.JWT_SECRET as string, {
      expiresIn: "1h",
    });
    sendMagicLinkEmail({ email, token });
    res.status(200).json({ msg: "请查看您的邮箱获取登录链接～" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const verify = async (req: Request, res: Response) => {
  const { token } = req.query;
  if (!token) {
    res.status(401).json({ msg: "Token is null" });
  }
  try {
    const { email } = jwt.verify(
      token as string,
      process.env.JWT_SECRET as string
    ) as JwtPayload;
    const user = await UserModel.findOne({ email }).exec();
    console.log(user);
    // res.send(`you are logged in as ${user!.email}`);
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};
