import express from "express";
import {
  addSoftwareApp,
  getAllSoftwareApps,
  deleteSoftwareApp,
} from "../controllers/softwareAppController.js";
import { isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

router.post("/add", isAuthenticated, addSoftwareApp);
router.get("/getAll", getAllSoftwareApps);
router.delete("/delete/:id", isAuthenticated, deleteSoftwareApp);

export default router;
