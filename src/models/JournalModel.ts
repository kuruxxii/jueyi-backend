import mongoose from "mongoose";
const { Schema, model } = mongoose;
import type { Journal } from "../lib/definitions";

const journalSchema = new Schema<Journal>(
  {
    title: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
    },
    vol: {
      type: Number,
      required: true,
      unique: true,
      immutable: true,
    },
    coverUrl: {
      type: String,
      required: true,
    },
    articles: {
      type: [String],
      required: true,
    },
  },
  { timestamps: true }
);

export const JournalModel = model("Journal", journalSchema);
