import mongoose from "mongoose";
const { Schema, model } = mongoose;

type News = {
  content: string[];
};

const newsSchema = new Schema<News>({
  content: {
    type: [String],
  },
});

export const NewsModel = model("News", newsSchema);
