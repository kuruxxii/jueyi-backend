import { Request, Response } from "express";
import { JournalModel } from "../models/JournalModel";
import { ArticleModel } from "../models/ArticleModel";
import { getOrSetCache } from "../lib/redis";

export const getPaginatedJournalsAndTotalPages = async (
  req: Request,
  res: Response
) => {
  const journalsPerPage = 9;
  const page: number = parseInt(req.query.page as string, 10) || 1;
  try {
    const journals = await getOrSetCache(`journals?page=${page}`, async () => {
      return await JournalModel.find()
        .limit(journalsPerPage)
        .skip((page - 1) * journalsPerPage)
        .sort({ vol: -1 })
        .exec();
    });
    const count = await getOrSetCache("journalsCount", async () => {
      return await JournalModel.countDocuments();
    });
    return res.status(200).json({
      journals,
      totalPages: Math.ceil(count / journalsPerPage),
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

export const getArticlePreviewsInJournal = async (
  req: Request,
  res: Response
) => {
  const { vol } = req.params;
  try {
    const journal = await getOrSetCache(`journal/${vol}`, async () => {
      return await JournalModel.findOne({ vol }).exec();
    });
    if (!journal) {
      res.status(400).json({ msg: "No such Journal" });
    } else {
      let articleSlugs = journal.articles;
      let articlePreviews = [];
      for (const slug of articleSlugs) {
        let articlePreview = await getOrSetCache(
          `articlePreviews/${slug}`,
          async () => {
            return await ArticleModel.findOne({ slug })
              .select(
                "slug title coverUrl introduction author read topic createdAt"
              )
              .exec();
          }
        );
        articlePreviews.push(articlePreview);
      }
      res.status(200).json({ journal, articlePreviews });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
