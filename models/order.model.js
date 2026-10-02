import mongoose from "mongoose";

// =====================================================
// ORDER ITEM SCHEMA
// =====================================================

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    name: {
      type: String,
      required: true,
    },

    image: {
      type: String,
      default: "",
    },

    price: {
      type: Number,
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    total: {
      type: Number,
      required: true,
    },
  },
  {
    _id: false,
  }
);

// =====================================================
// ORDER SCHEMA
// =====================================================

const orderSchema = new mongoose.Schema(
  {
    // =================================================
    // ORDER ID
    // =================================================

    orderId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    // =================================================
    // USER
    // =================================================

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // =================================================
    // CUSTOMER
    // =================================================

    customer: {
      name: {
        type: String,
        required: true,
      },

      mobile: {
        type: String,
        required: true,
      },

      address: {
        type: String,
        required: true,
      },

      city: {
        type: String,
        required: true,
      },

      pincode: {
        type: String,
        required: true,
      },

      message: {
        type: String,
        default: "",
      },
    },

    // =================================================
    // ITEMS
    // =================================================

    items: {
      type: [orderItemSchema],
      required: true,
    },

    // =================================================
    // TOTALS
    // =================================================

    itemsTotal: {
      type: Number,
      required: true,
    },

    shipping: {
      type: Number,
      default: 0,
    },

    shippingStatus: {
      type: String,
      enum: [
        "FREE",
        "PAYABLE_SEPARATELY",
      ],
      default: "FREE",
    },

    grandTotal: {
      type: Number,
      required: true,
    },

    // =================================================
    // PAYMENT
    // =================================================

    paymentMethod: {
      type: String,
      default: "WhatsApp Order",
    },

    // =================================================
    // CURRENT STATUS
    // =================================================

    status: {
      type: String,
      enum: [
        "Pending",
        "Confirmed",
        "Processing",
        "Shipped",
        "Delivered",
        "Cancelled",
      ],
      default: "Pending",
    },

    // =================================================
    // STATUS HISTORY DATES
    // =================================================

    statusDates: {
      Pending: {
        type: Date,
        default: null,
      },

      Confirmed: {
        type: Date,
        default: null,
      },

      Processing: {
        type: Date,
        default: null,
      },

      Shipped: {
        type: Date,
        default: null,
      },

      Delivered: {
        type: Date,
        default: null,
      },

      Cancelled: {
        type: Date,
        default: null,
      },
    },

    // =================================================
    // EXPECTED DELIVERY
    // Order date + 3 days
    // Cancelled hone par null
    // =================================================

    expectedDelivery: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// =====================================================
// MODEL
// =====================================================

const Order = mongoose.model(
  "Order",
  orderSchema
);

export default Order;