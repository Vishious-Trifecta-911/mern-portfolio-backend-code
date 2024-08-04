import express from "express";
import {
  registerUser,
  loginUser,
  logOutUser,
  getUserProfile,
  updateUserProfile,
  updateUserPassword,
  getUserPortfolio,
  forgotPassword,
  resetPassword,
} from "../controllers/userController.js";
import { isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/logout", isAuthenticated, logOutUser);
router.get("/profile", isAuthenticated, getUserProfile);
router.put("/profile/update", isAuthenticated, updateUserProfile);
router.put("/profile/updatePassword", isAuthenticated, updateUserPassword);
router.get("/profile/portfolio", getUserPortfolio);
router.post("/forgotPassword", forgotPassword);
router.put("/resetPassword/:token", resetPassword);

export default router;
