import { Request, Response } from "express";
import { NewsModel } from "../models/NewsModel";
import { getOrSetCache } from "../lib/redis";

export const getNews = async (req: Request, res: Response) => {
  try {
    const news = await getOrSetCache("news", async () => {
      return await NewsModel.findOne({}).exec();
    });
    if (!news) {
      return res.status(400).json({ error: "暂时没有新的通知" });
    } else {
      return res.status(200).json(news);
    }
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};
