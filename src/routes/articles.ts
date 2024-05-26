import { Router } from "express";
import { getAnArticle } from "../controllers/articles";

const router = Router();

// router.get("/", getFilteredArticles);
// router.get("/pages", getFilteredArticlesTotalPages);
router.get("/:slug", getAnArticle);
// router.post("/", addAnArticle);
// router.patch("/:slug", modifyAnArticle);
// router.delete("/:slug", deleteAnArticle);

export default router;
