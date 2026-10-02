
import { Router } from "express";
import upload from "../middleware/multer.js";

import {
  createCategoryController,
  getCategoryController,
  updateCategoryController,
  deleteCategoryController,
} from "../controllers/category.controller.js";

const categoryRouter = Router();

// CREATE
categoryRouter.post(
  "/create-category",
  upload.single("image"),
  createCategoryController
);

// GET ALL
categoryRouter.get(
  "/get-category",
  getCategoryController
);

// UPDATE
categoryRouter.put(
  "/update-category/:_id",
  upload.single("image"),
  updateCategoryController
);

// DELETE
categoryRouter.delete(
  "/delete-category/:_id",
  deleteCategoryController
);

export default categoryRouter;