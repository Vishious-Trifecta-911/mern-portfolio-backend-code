import express from "express";
import {
  addNewSkill,
  getAllSkills,
  deleteSkill,
  updateSkill,
} from "../controllers/skillController.js";
import { isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

router.post("/add", isAuthenticated, addNewSkill);
router.get("/getAll", getAllSkills);
router.put("/update/:id", isAuthenticated, updateSkill);
router.delete("/delete/:id", isAuthenticated, deleteSkill);

export default router;
