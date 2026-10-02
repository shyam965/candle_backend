import { Router } from "express";

import upload from "../middleware/multer.js";

import {
  createBannerController,
  getBannerController,
  getAllBannerController,
  deleteBannerController,
} from "../controllers/banner.controller.js";

const router = Router();


// CREATE
router.post(
  "/create-banner",
  upload.single("image"),
  createBannerController
);


// HOME
router.get(
  "/get-banner",
  getBannerController
);


// ADMIN
router.get(
  "/get-all-banner",
  getAllBannerController
);


// DELETE
router.delete(
  "/delete-banner/:id",
  deleteBannerController
);


export default router;