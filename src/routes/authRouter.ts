import express from "express";
import {
  signup,
  login,
  verifyUserByEmail,
} from "../controllers/authController";
export const router = express.Router();

router.route("/signup").post(signup);

router.route("/login").post(login);

router.route("/verifyEmail").patch(verifyUserByEmail);
