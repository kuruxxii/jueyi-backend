import { Request, Response } from "express";
import { ArticleModel } from "../models/ArticleModel";
import { getOrSetCache } from "../lib/redis";
import cron from "node-cron";

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

type Recommendation = {
  slug: string;
  title: string;
  author: string;
};

const ARTICLES_PER_PAGE = 8;

let randomRecommendations: Recommendation[];

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
    let articlePreviews = [];
    if (topic) {
      articlePreviews = await getOrSetCache(
        `articlePreviews?topic=${topic}&page=${page}`,
        async () => {
          return await ArticleModel.find({ topic: topicMap[topic] })
            .select(
              "slug title coverUrl introduction author read topic createdAt"
            )
            .limit(ARTICLES_PER_PAGE)
            .skip((page - 1) * ARTICLES_PER_PAGE)
            .sort({ createdAt: -1 })
            .exec();
        }
      );
    } else {
      articlePreviews = await getOrSetCache(
        `articles?page=${page}`,
        async () => {
          return await ArticleModel.find()
            .select(
              "slug title coverUrl introduction author read topic createdAt"
            )
            .limit(ARTICLES_PER_PAGE)
            .skip((page - 1) * ARTICLES_PER_PAGE)
            .sort({ createdAt: -1 })
            .exec();
        }
      );
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
      totalCounts = await getOrSetCache(
        `articlePreviews/totalCounts?topic=${topic}`,
        async () => {
          return await ArticleModel.countDocuments({
            topic: topicMap[topic],
          }).exec();
        }
      );
      totalPages = Math.ceil(totalCounts / ARTICLES_PER_PAGE);
    } else {
      totalCounts = await getOrSetCache(
        `articlePreviews/totalCounts`,
        async () => {
          return await ArticleModel.countDocuments().exec();
        }
      );
      totalPages = Math.ceil(totalCounts / ARTICLES_PER_PAGE);
    }
    return res.status(200).json(totalPages);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

// Fetch initial set of random recommendations
const fetchRecommendations = async () => {
  try {
    randomRecommendations = await ArticleModel.aggregate([
      { $sample: { size: 3 } },
      { $project: { slug: 1, title: 1, author: 1 } },
    ]);
  } catch (error) {
    console.log(error);
  }
};

// Fetch recommendations immediately on startup
fetchRecommendations();

cron.schedule("0 0 * * SUN", async function () {
  try {
    randomRecommendations = await ArticleModel.aggregate([
      { $sample: { size: 3 } },
      { $project: { slug: 1, title: 1, author: 1 } },
    ]);
  } catch (error) {
    console.log(error);
  }
});

export const getRecommendations = async (req: Request, res: Response) => {
  if (randomRecommendations) {
    return res.status(200).json(randomRecommendations);
  } else {
    return res.status(400).json({ error: "获取推荐阅读失败" });
  }
};
