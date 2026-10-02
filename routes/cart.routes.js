import { Router } from "express";

import authMiddleware from "../middleware/auth.middleware.js";

import {
  getCartController,
  addToCartController,
  updateCartController,
  removeFromCartController,
  toggleCartController,
  clearCartController,
} from "../controllers/cart.controller.js";

const cartRouter = Router();

cartRouter.get(
  "/",
  authMiddleware,
  getCartController
);

cartRouter.post(
  "/add",
  authMiddleware,
  addToCartController
);

cartRouter.put(
  "/update",
  authMiddleware,
  updateCartController
);

cartRouter.delete(
  "/remove/:productId",
  authMiddleware,
  removeFromCartController
);

cartRouter.put(
  "/toggle",
  authMiddleware,
  toggleCartController
);

cartRouter.delete(
  "/clear",
  authMiddleware,
  clearCartController
);

export default cartRouter;