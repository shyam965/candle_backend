import { Router } from "express";

import {
  registerController,
  loginController,
  meController,
  logoutController,
} from "../controllers/auth.controller.js";

import authMiddleware from "../middleware/auth.middleware.js";

const authRouter = Router();

authRouter.post("/register", registerController);

authRouter.post("/login", loginController);

authRouter.get("/me", authMiddleware, meController);

authRouter.post("/logout", logoutController);

export default authRouter;