import Banner from "../models/banner.model.js";
import fs from "fs";
import path from "path";


// =============================
// CREATE BANNER
// =============================
export const createBannerController = async (req, res) => {
  try {
    const {
      title,
      subtitle,
      buttonText,
      buttonLink,
      order,
      status,
    } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Banner title is required",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Banner image is required",
      });
    }

    const image = `/uploads/${req.file.filename}`;

    const banner = await Banner.create({
      title,
      subtitle: subtitle || "",
      image,
      buttonText: buttonText || "Shop Now",
      buttonLink: buttonLink || "/shop",
      order: Number(order) || 0,
      status:
        status === undefined
          ? true
          : status === "true" || status === true,
    });

    return res.status(201).json({
      success: true,
      message: "Banner created successfully",
      data: banner,
    });
  } catch (error) {
    console.error("CREATE BANNER ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// =============================
// GET ACTIVE BANNERS
// =============================
export const getBannerController = async (req, res) => {
  try {
    const banners = await Banner.find({
      status: true,
    }).sort({
      order: 1,
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      data: banners,
    });
  } catch (error) {
    console.error("GET BANNER ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// =============================
// GET ALL BANNERS - ADMIN
// =============================
export const getAllBannerController = async (req, res) => {
  try {
    const banners = await Banner.find().sort({
      order: 1,
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      data: banners,
    });
  } catch (error) {
    console.error("GET ALL BANNER ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// =============================
// DELETE BANNER
// =============================
export const deleteBannerController = async (req, res) => {
  try {
    const { id } = req.params;

    const banner = await Banner.findById(id);

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: "Banner not found",
      });
    }

    // Delete image from uploads folder
    if (banner.image) {
      const imagePath = path.join(
        process.cwd(),
        banner.image.replace("/", "")
      );

      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await Banner.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Banner deleted successfully",
    });
  } catch (error) {
    console.error("DELETE BANNER ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};