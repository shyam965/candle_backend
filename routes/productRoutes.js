
import { Router } from "express";
import upload from "../middleware/multer.js";

import {
  createProductController,
  getProductController,
  updateProductController,
  deleteProductController,
} from "../controllers/product.controller.js";

const productRouter = Router();

productRouter.post(
  "/create-product",
  upload.single("image"),
  createProductController
);

productRouter.get(
  "/get-product",
  getProductController
);

productRouter.put(
  "/update-product/:_id",
  upload.single("image"),
  updateProductController
);

productRouter.delete(
  "/delete-product/:_id",
  deleteProductController
);

export default productRouter;