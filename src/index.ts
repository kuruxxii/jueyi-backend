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
import newsRouter from "./routes/news";
import { rateLimit } from "express-rate-limit";

const app = express();

// Configure the rate limiter
const authRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // Limit each IP to 5 auth requests per `window` (here, per 1 minute)
  message: JSON.stringify({ msg: "您已达到请求限制，请稍后再试。" }), // Custom message when rate limit is exceeded
  headers: true, // Include rate limit info in the `RateLimit-*` headers
});

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
app.use("/api/auth", authRateLimiter, authRouter);
app.use("/api/articles", ensureAuthenticated, articlesRouter);
app.use("/api/journals", ensureAuthenticated, journalsRouter);
app.use("/api/news", ensureAuthenticated, newsRouter);

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
