import PromoCard from "../models/promoCard.model.js";
import fs from "fs";
import path from "path";


// =============================
// CREATE PROMO CARD
// =============================
export const createPromoCardController = async (req, res) => {
  try {
    const {
      title,
      subtitle,
      buttonText,
      buttonLink,
      background,
      order,
      status,
    } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Promo card title is required",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Promo card image is required",
      });
    }

    const image = `/uploads/${req.file.filename}`;

    const promoCard = await PromoCard.create({
      title,
      subtitle: subtitle || "",
      image,
      buttonText: buttonText || "Shop Now",
      buttonLink: buttonLink || "/shop",
      background: background || "#08aaa6",
      order: Number(order) || 0,
      status:
        status === undefined
          ? true
          : status === "true" || status === true,
    });

    return res.status(201).json({
      success: true,
      message: "Promotional card created successfully",
      data: promoCard,
    });
  } catch (error) {
    console.error("CREATE PROMO ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// =============================
// GET ACTIVE PROMO CARDS
// =============================
export const getPromoCardController = async (req, res) => {
  try {
    const cards = await PromoCard.find({
      status: true,
    }).sort({
      order: 1,
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      data: cards,
    });
  } catch (error) {
    console.error("GET PROMO ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// =============================
// GET ALL PROMO CARDS - ADMIN
// =============================
export const getAllPromoCardController = async (req, res) => {
  try {
    const cards = await PromoCard.find().sort({
      order: 1,
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      data: cards,
    });
  } catch (error) {
    console.error("GET ALL PROMO ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// =============================
// DELETE PROMO CARD
// =============================
export const deletePromoCardController = async (req, res) => {
  try {
    const { id } = req.params;

    const card = await PromoCard.findById(id);

    if (!card) {
      return res.status(404).json({
        success: false,
        message: "Promo card not found",
      });
    }

    // Delete image
    if (card.image) {
      const imagePath = path.join(
        process.cwd(),
        card.image.replace("/", "")
      );

      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await PromoCard.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Promotional card deleted successfully",
    });
  } catch (error) {
    console.error("DELETE PROMO ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};