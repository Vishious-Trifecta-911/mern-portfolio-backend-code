import express from "express";
import { sendMessage, getAllMessages, deleteMessage } from "../controllers/messageController.js";
import { isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

router.post("/send", sendMessage);
router.get("/getAll", getAllMessages);
router.delete("/delete/:id", isAuthenticated, deleteMessage);

export default router;
