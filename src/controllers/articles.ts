import { Request, Response } from "express";
import { ArticleModel } from "../models/ArticleModel";

export const getAnArticle = async (req: Request, res: Response) => {
  const { slug } = req.params;
  try {
    const article = await ArticleModel.findOne({ slug }).exec();
    if (!article) {
      res.status(400).json("No such article");
    } else {
      res.status(200).json(article);
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
