import { Request, Response } from "express";
import { ArticleModel } from "../models/ArticleModel";
import { getOrSetCache } from "../lib/redis";

export const getAnArticle = async (req: Request, res: Response) => {
  const { slug } = req.params;

  try {
    const article = await getOrSetCache(`articles/${slug}`, async () => {
      return await ArticleModel.findOne({ slug }).exec();
    });

    if (!article) {
      return res.status(400).json({ error: "文章不存在" });
    } else {
      return res.status(200).json(article);
    }
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};
