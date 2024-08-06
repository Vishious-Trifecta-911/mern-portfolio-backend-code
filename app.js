import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import fileUpload from "express-fileupload";
import { errorMiddleware } from "./middlewares/error.js";
import messageRouter from "./router/messageRoutes.js";
import userRouter from "./router/userRoutes.js";
import timelineRouter from "./router/timelineRoutes.js";
import softwareAppRouter from "./router/softwareAppRoutes.js";
import skillRouter from "./router/skillRoutes.js";
import ProjectRouter from "./router/projectRoutes.js";
import dbConnection from "./database/dbConnection.js";

const app = express();

dotenv.config({ path: "./config/config.env" });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: [process.env.PORTFOLIO_URL, process.env.DASHBOARD_URL],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(cookieParser());
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "./tmp/",
  })
);

app.use("/api/v1/message", messageRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/timelines", timelineRouter);
app.use("/api/v1/softwareApps", softwareAppRouter);
app.use("/api/v1/skills", skillRouter);
app.use("/api/v1/projects", ProjectRouter);

dbConnection();

app.use(errorMiddleware);

export default app;
