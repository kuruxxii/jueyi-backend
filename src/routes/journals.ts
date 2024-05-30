import { Router } from "express";
const router = Router();

import {
  getPaginatedJournalsAndTotalPages,
  getArticlePreviewsInJournal,
} from "../controllers/journals";

router.get("/", getPaginatedJournalsAndTotalPages);
router.get("/:vol", getArticlePreviewsInJournal);

export default router;
