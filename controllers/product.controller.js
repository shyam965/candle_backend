
import mongoose from "mongoose";
import Product from "../models/Product.js";
import Category from "../models/Category.js";

import fs from "fs/promises";
import path from "path";


export const createProductController = async (req, res) => {
  try {
    const {
      name,
      category,
      price,
      oldPrice,
      stock,
      description,
    } = req.body;

    // Required fields validation
    if (
      !name?.trim() ||
      !category ||
      price === undefined ||
      price === "" ||
      stock === undefined ||
      stock === ""
    ) {
      return res.status(400).json({
        message: "Name, category, price and stock are required",
        success: false,
        error: true,
      });
    }

    // Image validation
    if (!req.file) {
      return res.status(400).json({
        message: "Please upload an image",
        success: false,
        error: true,
      });
    }

    // Category ID validation
    if (!mongoose.isValidObjectId(category)) {
      return res.status(400).json({
        message: "Invalid category ID",
        success: false,
        error: true,
      });
    }

    // Check category exists
    const existingCategory = await Category.findById(category);

    if (!existingCategory) {
      return res.status(404).json({
        message: "Category not found",
        success: false,
        error: true,
      });
    }

    // Price and stock validation
    if (
      !Number.isFinite(Number(price)) ||
      Number(price) < 1 ||
      !Number.isInteger(Number(stock)) ||
      Number(stock) < 0 ||
      (oldPrice !== undefined &&
        oldPrice !== "" &&
        (!Number.isFinite(Number(oldPrice)) ||
          Number(oldPrice) < 1))
    ) {
      return res.status(400).json({
        message: "Invalid price, old price or stock",
        success: false,
        error: true,
      });
    }

    // Check duplicate product
    const existingProduct = await Product.findOne({
      name: name.trim(),
      category,
    });

    if (existingProduct) {
      return res.status(409).json({
        message: "Product already exists",
        success: false,
        error: true,
      });
    }

    // Create product
    const product = await Product.create({
      name: name.trim(),
      category,
      price: Number(price),
      ...(oldPrice !== undefined && oldPrice !== ""
        ? { oldPrice: Number(oldPrice) }
        : {}),
      stock: Number(stock),
      description: description?.trim() || "",
      image: `/uploads/${req.file.filename}`,
    });

    return res.status(201).json({
      message: "Product created successfully",
      success: true,
      error: false,
      data: product,
    });

  } catch (error) {
    console.error("Create Product error:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: error.message,
        success: false,
        error: true,
      });
    }

    return res.status(500).json({
      message: "Internal server error",
      success: false,
      error: true,
    });
  }
};


export const getProductController = async (req, res) => {
  try {

    const query =[[
          {
            $addFields: {
              _id: { $toString: "$_id" }
            }
          }
        ]]

    const products = await Product.aggregate(query)
    if (!products){
         return res
        .status(404)
        .json({ message: "products not found", success: false });
    }
    return res.status(200).json({
      message: "products fetched successfully",
      data: products,
    });

    
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};


// Delete uploaded image safely
const deleteProductImage = async (image) => {
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

// UPDATE PRODUCT
export const updateProductController = async (req, res) => {
  const { _id } = req.params;

  try {
    if (!mongoose.isValidObjectId(_id)) {
      return res.status(400).json({
        message: "Invalid product ID",
        success: false,
        error: true,
      });
    }

    const product = await Product.findById(_id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
        success: false,
        error: true,
      });
    }

    const {
      name,
      category,
      price,
      oldPrice,
      stock,
      description,
    } = req.body;

    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({
          message: "Product name is required",
          success: false,
          error: true,
        });
      }

      product.name = name.trim();
    }

    if (category !== undefined) {
      if (!mongoose.isValidObjectId(category)) {
        return res.status(400).json({
          message: "Invalid category ID",
          success: false,
          error: true,
        });
      }

      const categoryExists = await Category.exists({
        _id: category,
      });

      if (!categoryExists) {
        return res.status(404).json({
          message: "Category not found",
          success: false,
          error: true,
        });
      }

      product.category = category;
    }

    if (price !== undefined) {
      if (
        price === "" ||
        !Number.isFinite(Number(price)) ||
        Number(price) < 1
      ) {
        return res.status(400).json({
          message: "Invalid price",
          success: false,
          error: true,
        });
      }

      product.price = Number(price);
    }

    if (oldPrice !== undefined) {
      if (oldPrice === "") {
        product.oldPrice = undefined;
      } else if (
        !Number.isFinite(Number(oldPrice)) ||
        Number(oldPrice) < 1
      ) {
        return res.status(400).json({
          message: "Invalid old price",
          success: false,
          error: true,
        });
      } else {
        product.oldPrice = Number(oldPrice);
      }
    }

    if (
      product.oldPrice !== undefined &&
      product.oldPrice < product.price
    ) {
      return res.status(400).json({
        message: "Old price cannot be less than price",
        success: false,
        error: true,
      });
    }

    if (stock !== undefined) {
      if (
        stock === "" ||
        !Number.isInteger(Number(stock)) ||
        Number(stock) < 0
      ) {
        return res.status(400).json({
          message: "Invalid stock",
          success: false,
          error: true,
        });
      }

      product.stock = Number(stock);
    }

    if (description !== undefined) {
      product.description = description.trim();
    }

    const oldImage = product.image;

    if (req.file) {
      product.image = `/uploads/${req.file.filename}`;
    }

    await product.save();

    if (req.file && oldImage !== product.image) {
      await deleteProductImage(oldImage);
    }

    return res.status(200).json({
      message: "Product updated successfully",
      success: true,
      error: false,
      data: product,
    });
  } catch (error) {
    if (req.file) {
      await deleteProductImage(
        `/uploads/${req.file.filename}`
      );
    }

    return res.status(500).json({
      message: error.message,
      success: false,
      error: true,
    });
  }
};

// DELETE PRODUCT
export const deleteProductController = async (req, res) => {
  try {
    const { _id } = req.params;

    if (!mongoose.isValidObjectId(_id)) {
      return res.status(400).json({
        message: "Invalid product ID",
        success: false,
        error: true,
      });
    }

    const product = await Product.findByIdAndDelete(_id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
        success: false,
        error: true,
      });
    }

    await deleteProductImage(product.image);

    return res.status(200).json({
      message: "Product deleted successfully",
      success: true,
      error: false,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
      success: false,
      error: true,
    });
  }
};

