import mongoose from "mongoose";
const { Schema, model } = mongoose;
import type { Article } from "../lib/definitions";

const articleSchema = new Schema<Article>(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: true,
    },
    coverUrl: {
      type: String,
      required: true,
    },
    introduction: {
      type: String,
      required: true,
    },
    author: {
      type: String,
      required: true,
    },
    read: {
      type: Number,
      required: true,
    },
    topic: {
      type: String,
      required: true,
    },
    origin: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export const ArticleModel = model("Article", articleSchema);
