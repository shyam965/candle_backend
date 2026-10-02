import { Router } from "express";

import authMiddleware
  from "../middleware/auth.middleware.js";

import adminMiddleware
  from "../middleware/admin.middleware.js";

import {
  createOrderController,
  getMyOrdersController,
  getMyOrderByIdController,
  getAllOrdersController,
  updateOrderStatusController,
} from "../controllers/order.controller.js";


const orderRouter = Router();


// =====================================================
// USER
// =====================================================

orderRouter.post(
  "/create",
  authMiddleware,
  createOrderController
);


orderRouter.get(
  "/my-orders",
  authMiddleware,
  getMyOrdersController
);


orderRouter.get(
  "/my-orders/:id",
  authMiddleware,
  getMyOrderByIdController
);


// =====================================================
// ADMIN
// =====================================================

orderRouter.get(
  "/all",
  authMiddleware,
  adminMiddleware,
  getAllOrdersController
);


orderRouter.put(
  "/status/:id",
  authMiddleware,
  adminMiddleware,
  updateOrderStatusController
);


export default orderRouter;