
import Category from "../models/Category.js";
import Product from "../models/Product.js";
import mongoose from "mongoose";
import fs from "fs/promises";
import path from "path";

export const createCategoryController = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({
        message: "Category name is required",
        success: false,
        error: true,
      });
    }

    if (!req.file) {
      return res.status(400).json({
        message: "Please upload an image",
        success: false,
        error: true,
      });
    }

    const existingCategory = await Category.findOne({
      name: name.trim(),
    });

    if (existingCategory) {
      return res.status(409).json({
        message: "Category already exists",
        success: false,
        error: true,
      });
    }

    const category = await Category.create({
      name: name.trim(),
      description: description?.trim() || "",
      image: `/uploads/${req.file.filename}`,
    });

    return res.status(201).json({
      message: "Category created successfully",
      success: true,
      error: false,
      data: category,
    });
  } catch (error) {
    console.error("Create category error:", error);

    return res.status(500).json({
      message: error.message,
      success: false,
      error: true,
    });
  }
};


export const getCategoryController = async (req, res) => {
  try {

    const query =[[
          {
            $addFields: {
              _id: { $toString: "$_id" }
            }
          }
        ]]
    // const categories = await Category.find().sort({ createdAt: -1 });
    const categories = await Category.aggregate(query)
    if (!categories){
         return res
        .status(404)
        .json({ message: "category not found", success: false });
    }
    return res.status(200).json({
      message: "categories fetched successfully",
      data: categories,
    });

    
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};


// Uploaded image delete helper
const deleteCategoryImage = async (image) => {
  if (!image?.startsWith("/uploads/")) return;

  try {
    await fs.unlink(
      path.join(
        process.cwd(),
        "uploads",
        path.basename(image)
      )
    );
  } catch (error) {
    if (error.code !== "ENOENT") {
      console.error("Image delete error:", error);
    }
  }
};

// UPDATE CATEGORY
export const updateCategoryController = async (req, res) => {
  const { _id } = req.params;

  const newImage = req.file
    ? `/uploads/${req.file.filename}`
    : null;

  try {
    if (!mongoose.isValidObjectId(_id)) {
      if (newImage) await deleteCategoryImage(newImage);

      return res.status(400).json({
        message: "Invalid category ID",
        success: false,
        error: true,
      });
    }

    const category = await Category.findById(_id);

    if (!category) {
      if (newImage) await deleteCategoryImage(newImage);

      return res.status(404).json({
        message: "Category not found",
        success: false,
        error: true,
      });
    }

    const { name, description } = req.body;

    // Validate name
    if (name !== undefined) {
      if (
        typeof name !== "string" ||
        !name.trim()
      ) {
        if (newImage) await deleteCategoryImage(newImage);

        return res.status(400).json({
          message: "Category name is required",
          success: false,
          error: true,
        });
      }

      const trimmedName = name.trim();

      // Check duplicate category
      const duplicate = await Category.findOne({
        name: trimmedName,
        _id: { $ne: _id },
      });

      if (duplicate) {
        if (newImage) await deleteCategoryImage(newImage);

        return res.status(409).json({
          message: "Category already exists",
          success: false,
          error: true,
        });
      }

      category.name = trimmedName;
    }

    if (description !== undefined) {
      category.description =
        typeof description === "string"
          ? description.trim()
          : "";
    }

    const oldImage = category.image;

    if (newImage) {
      category.image = newImage;
    }

    await category.save();

    // Delete old image after successful update
    if (newImage && oldImage !== newImage) {
      await deleteCategoryImage(oldImage);
    }

    return res.status(200).json({
      message: "Category updated successfully",
      success: true,
      error: false,
      data: category,
    });
  } catch (error) {
    if (newImage) {
      await deleteCategoryImage(newImage);
    }

    if (error.code === 11000) {
      return res.status(409).json({
        message: "Category already exists",
        success: false,
        error: true,
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: error.message,
        success: false,
        error: true,
      });
    }

    console.error("Update category error:", error);

    return res.status(500).json({
      message: "Internal server error",
      success: false,
      error: true,
    });
  }
};

// DELETE CATEGORY
export const deleteCategoryController = async (req, res) => {
  try {
    const { _id } = req.params;

    if (!mongoose.isValidObjectId(_id)) {
      return res.status(400).json({
        message: "Invalid category ID",
        success: false,
        error: true,
      });
    }

    const category = await Category.findById(_id);

    if (!category) {
      return res.status(404).json({
        message: "Category not found",
        success: false,
        error: true,
      });
    }

    // Prevent deleting categories used by products
    const hasProducts = await Product.exists({
      category: _id,
    });

    if (hasProducts) {
      return res.status(409).json({
        message:
          "This category contains products. Delete or reassign those products first.",
        success: false,
        error: true,
      });
    }

    await category.deleteOne();

    // Remove uploaded image
    await deleteCategoryImage(category.image);

    return res.status(200).json({
      message: "Category deleted successfully",
      success: true,
      error: false,
      data: category,
    });
  } catch (error) {
    console.error("Delete category error:", error);

    return res.status(500).json({
      message: "Internal server error",
      success: false,
      error: true,
    });
  }
};


