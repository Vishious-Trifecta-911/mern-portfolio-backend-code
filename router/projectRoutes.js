import express from "express";
import {
  addNewProject,
  getProjectById,
  getAllProjects,
  updateProject,
  deleteProject,
} from "../controllers/projectController.js";
import { isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

router.post("/add", isAuthenticated, addNewProject);
router.get("/getById/:id", getProjectById);
router.get("/getAll", getAllProjects);
router.put("/update/:id", isAuthenticated, updateProject);
router.delete("/delete/:id", isAuthenticated, deleteProject);

export default router;
