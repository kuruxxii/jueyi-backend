import { Request, Response } from "express";
import { ArticleModel } from "../models/ArticleModel";
import { getOrSetCache } from "../lib/redis";

type ArticlePreview = {
  slug: string;
  title: string;
  coverUrl: string;
  introduction: string;
  author: string;
  read: number;
  topic: string;
};
type Topic =
  | "personal"
  | "business"
  | "technology"
  | "humanities"
  | "workplace"
  | "school";
const topicMap = {
  personal: "个人成长",
  business: "商业财经",
  technology: "科技前沿",
  humanities: "人文社科",
  workplace: "职场专题",
  school: "校园学习专题",
};

const ARTICLES_PER_PAGE = 8;

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

export const getFilteredArticlePreviews = async (
  req: Request,
  res: Response
) => {
  const page: number = parseInt(req.query.page as string, 10) || 1;
  const topic: Topic | undefined = (req.query.topic as Topic) || undefined;
  try {
    let articlePreviews: ArticlePreview[] = [];
    if (topic) {
      articlePreviews = await ArticleModel.find({ topic: topicMap[topic] })
        .select("slug title coverUrl introduction author read topic")
        .limit(ARTICLES_PER_PAGE)
        .skip((page - 1) * ARTICLES_PER_PAGE)
        .sort({ createdAt: -1 })
        .exec();
    } else {
      articlePreviews = await ArticleModel.find()
        .select("slug title coverUrl introduction author read topic")
        .limit(ARTICLES_PER_PAGE)
        .skip((page - 1) * ARTICLES_PER_PAGE)
        .sort({ createdAt: -1 })
        .exec();
    }
    return res.status(200).json(articlePreviews);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

export const getFilteredArticlePreviewTotalPages = async (
  req: Request,
  res: Response
) => {
  const topic: Topic | undefined = (req.query.topic as Topic) || undefined;
  try {
    let totalPages = 1,
      totalCounts = 1;
    if (topic) {
      totalCounts = await ArticleModel.countDocuments({
        topic: topicMap[topic],
      }).exec();
      totalPages = Math.ceil(totalCounts / ARTICLES_PER_PAGE);
    } else {
      totalCounts = await ArticleModel.countDocuments().exec();
      totalPages = Math.ceil(totalCounts / ARTICLES_PER_PAGE);
    }
    return res.status(200).json(totalPages);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};
