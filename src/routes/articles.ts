import { Router } from "express";
import {
  getAnArticle,
  getFilteredArticlePreviews,
  getFilteredArticlePreviewTotalPages,
  getRecommendations,
} from "../controllers/articles";

const router = Router();

router.get("/", getFilteredArticlePreviews);
router.get("/pages", getFilteredArticlePreviewTotalPages);
router.get("/recommendations", getRecommendations);
router.get("/:slug", getAnArticle);

export default router;
