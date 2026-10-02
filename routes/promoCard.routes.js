import { Router } from "express";

import upload from "../middleware/multer.js";

import {
  createPromoCardController,
  getPromoCardController,
  getAllPromoCardController,
  deletePromoCardController,
} from "../controllers/promoCard.controller.js";

const router = Router();


// CREATE PROMO CARD
router.post(
  "/create-promo-card",
  upload.single("image"),
  createPromoCardController
);


// GET ACTIVE PROMO CARDS
router.get(
  "/get-promo-card",
  getPromoCardController
);


// GET ALL PROMO CARDS
router.get(
  "/get-all-promo-card",
  getAllPromoCardController
);


// DELETE PROMO CARD
router.delete(
  "/delete-promo-card/:id",
  deletePromoCardController
);


export default router;