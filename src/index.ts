import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import { ensureAuthenticated } from "./middleware/ensureAuthenticated";
import authRouter from "./routes/auth";
import articlesRouter from "./routes/articles";
import journalsRouter from "./routes/journals";

const app = express();

app.use(morgan("combined"));
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req: Request, res: Response) => {
  res.send("Hello, World!");
});
app.use("/api/auth", authRouter);
app.use("/api/articles", ensureAuthenticated, articlesRouter);
app.use("/api/journals", ensureAuthenticated, journalsRouter);

mongoose
  .connect(process.env.DB_URI as string)
  .then(() => {
    console.log("connected to database");
    app.listen(process.env.PORT, () => {
      console.log("listening for requests on port", process.env.PORT);
    });
  })
  .catch((err) => {
    console.log(err);
  });
