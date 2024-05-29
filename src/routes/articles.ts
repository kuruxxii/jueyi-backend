import { Router } from "express";
import {
  getAnArticle,
  getFilteredArticlePreviews,
  getFilteredArticlePreviewTotalPages,
} from "../controllers/articles";

const router = Router();

router.get("/", getFilteredArticlePreviews);
router.get("/pages", getFilteredArticlePreviewTotalPages);
router.get("/:slug", getAnArticle);

export default router;
