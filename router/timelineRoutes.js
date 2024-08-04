import express from "express";
import {
  addTimelineEvent,
  getAllTimelineEvents,
  deleteTimelineEvent,
} from "../controllers/timelineController.js";
import { isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

router.post("/add", isAuthenticated, addTimelineEvent);
router.get("/getAll", getAllTimelineEvents);
router.delete("/delete/:id", isAuthenticated, deleteTimelineEvent);

export default router;
