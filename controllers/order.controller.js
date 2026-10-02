import Order from "../models/order.model.js";
import Cart from "../models/cart.model.js";

// =====================================================
// CREATE ORDER
// =====================================================

export const createOrderController = async (
  req,
  res
) => {
  try {
    const userId = req.user._id;

    const {
      customer,
      items,
      itemsTotal,
      shipping = 0,
      shippingStatus = "FREE",
      grandTotal,
      paymentMethod = "WhatsApp Order",
    } = req.body;

    // =================================================
    // CUSTOMER VALIDATION
    // =================================================

    if (
      !customer ||
      !customer.name ||
      !customer.mobile ||
      !customer.address ||
      !customer.city ||
      !customer.pincode
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide complete customer details",
      });
    }

    // =================================================
    // ITEMS VALIDATION
    // =================================================

    if (
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "At least one product is required",
      });
    }

    // =================================================
    // NORMALIZE ITEMS
    // =================================================

    const normalizedItems = items.map(
      (item) => {
        const productId =
          item.product ||
          item.productId;

        const price =
          Number(item.price || 0);

        const quantity =
          Number(item.quantity || 1);

        return {
          product: productId,

          name: item.name,

          image:
            item.image || "",

          price,

          quantity,

          total:
            price * quantity,
        };
      }
    );

    // =================================================
    // VALIDATE ITEMS
    // =================================================

    const invalidItem =
      normalizedItems.find(
        (item) =>
          !item.product ||
          !item.name ||
          item.quantity <= 0
      );

    if (invalidItem) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid order product data",
      });
    }

    // =================================================
    // ORDER ID
    // =================================================

    const orderId =
      `AKRF-${Date.now()}-${Math.floor(
        1000 + Math.random() * 9000
      )}`;

    // =================================================
    // ORDER DATE
    // =================================================

    const orderDate =
      new Date();

    // =================================================
    // EXPECTED DELIVERY
    // ORDER DATE + 3 DAYS
    // =================================================

    const expectedDelivery =
      new Date(orderDate);

    expectedDelivery.setDate(
      expectedDelivery.getDate() + 3
    );

    // =================================================
    // CREATE ORDER
    // =================================================

    const order =
      await Order.create({
        orderId,

        user: userId,

        customer: {
          name:
            customer.name.trim(),

          mobile:
            customer.mobile.trim(),

          address:
            customer.address.trim(),

          city:
            customer.city.trim(),

          pincode:
            customer.pincode.trim(),

          message:
            customer.message?.trim() ||
            "",
        },

        items:
          normalizedItems,

        itemsTotal:
          Number(
            itemsTotal || 0
          ),

        shipping:
          Number(
            shipping || 0
          ),

        shippingStatus,

        grandTotal:
          Number(
            grandTotal || 0
          ),

        paymentMethod,

        // =================================================
        // INITIAL STATUS
        // =================================================

        status: "Pending",

        // =================================================
        // INITIAL STATUS DATE
        // =================================================

        statusDates: {
          Pending: orderDate,

          Confirmed: null,

          Processing: null,

          Shipped: null,

          Delivered: null,

          Cancelled: null,
        },

        // =================================================
        // EXPECTED DELIVERY
        // =================================================

        expectedDelivery,
      });

    // =================================================
    // REMOVE ORDERED PRODUCTS FROM CART
    // =================================================

    const cart =
      await Cart.findOne({
        user: userId,
      });

    if (cart) {
      const orderedProductIds =
        normalizedItems.map(
          (item) =>
            String(
              item.product
            )
        );

      cart.items =
        cart.items.filter(
          (cartItem) =>
            !orderedProductIds.includes(
              String(
                cartItem.product
              )
            )
        );

      await cart.save();
    }

    // =================================================
    // POPULATE ORDER
    // =================================================

    const populatedOrder =
      await Order.findById(
        order._id
      )
        .populate(
          "items.product"
        )
        .populate(
          "user",
          "-password"
        );

    // =================================================
    // RESPONSE
    // =================================================

    return res.status(201).json({
      success: true,

      message:
        "Order created successfully",

      order:
        populatedOrder,
    });

  } catch (error) {
    console.error(
      "CREATE ORDER ERROR:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Unable to create order",

      error:
        error.message,
    });
  }
};

// =====================================================
// GET MY ORDERS
// =====================================================

export const getMyOrdersController =
  async (
    req,
    res
  ) => {
    try {
      const orders =
        await Order.find({
          user:
            req.user._id,
        })
          .populate(
            "items.product"
          )
          .sort({
            createdAt: -1,
          });

      return res.status(200).json({
        success: true,

        orders,
      });

    } catch (error) {
      console.error(
        "GET MY ORDERS ERROR:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          "Unable to get orders",
      });
    }
  };

// =====================================================
// GET MY ORDER BY ID
// =====================================================

export const getMyOrderByIdController =
  async (
    req,
    res
  ) => {
    try {
      const order =
        await Order.findOne({
          _id:
            req.params.id,

          user:
            req.user._id,
        }).populate(
          "items.product"
        );

      if (!order) {
        return res.status(404).json({
          success: false,

          message:
            "Order not found",
        });
      }

      return res.status(200).json({
        success: true,

        order,
      });

    } catch (error) {
      console.error(
        "GET ORDER ERROR:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          "Unable to get order details",
      });
    }
  };

// =====================================================
// ADMIN GET ALL ORDERS
// =====================================================

export const getAllOrdersController =
  async (
    req,
    res
  ) => {
    try {
      const orders =
        await Order.find()
          .populate(
            "user",
            "-password"
          )
          .populate(
            "items.product"
          )
          .sort({
            createdAt: -1,
          });

      return res.status(200).json({
        success: true,

        orders,
      });

    } catch (error) {
      console.error(
        "GET ALL ORDERS ERROR:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          "Unable to get orders",
      });
    }
  };

// =====================================================
// UPDATE ORDER STATUS
// =====================================================

export const updateOrderStatusController =
  async (
    req,
    res
  ) => {
    try {
      const {
        status,
      } = req.body;

      // =================================================
      // ALLOWED STATUSES
      // =================================================

      const allowedStatuses = [
        "Pending",
        "Confirmed",
        "Processing",
        "Shipped",
        "Delivered",
        "Cancelled",
      ];

      if (
        !allowedStatuses.includes(
          status
        )
      ) {
        return res.status(400).json({
          success: false,

          message:
            "Invalid order status",
        });
      }

      // =================================================
      // FIND ORDER
      // =================================================

      const order =
        await Order.findById(
          req.params.id
        );

      if (!order) {
        return res.status(404).json({
          success: false,

          message:
            "Order not found",
        });
      }

      // =================================================
      // CURRENT DATE/TIME
      // =================================================

      const statusDate =
        new Date();

      // =================================================
      // UPDATE CURRENT STATUS
      // =================================================

      order.status =
        status;

      // =================================================
      // MAKE SURE STATUS DATES EXISTS
      // =================================================

      if (!order.statusDates) {
        order.statusDates = {};
      }

      // =================================================
      // SAVE STATUS DATE
      // =================================================

      order.statusDates[
        status
      ] = statusDate;

      // =================================================
      // CANCELLED
      // REMOVE EXPECTED DELIVERY
      // =================================================

      if (
        status === "Cancelled"
      ) {
        order.expectedDelivery =
          null;
      }

      // =================================================
      // IF ORDER REOPENED
      // RESTORE EXPECTED DELIVERY
      // =================================================

      if (
        status !== "Cancelled" &&
        !order.expectedDelivery
      ) {
        const expectedDelivery =
          new Date();

        expectedDelivery.setDate(
          expectedDelivery.getDate() +
            3
        );

        order.expectedDelivery =
          expectedDelivery;
      }

      // =================================================
      // SAVE
      // =================================================

      await order.save();

      // =================================================
      // GET UPDATED ORDER
      // =================================================

      const updatedOrder =
        await Order.findById(
          order._id
        )
          .populate(
            "items.product"
          )
          .populate(
            "user",
            "-password"
          );

      // =================================================
      // RESPONSE
      // =================================================

      return res.status(200).json({
        success: true,

        message:
          `Order status changed to ${status}`,

        order:
          updatedOrder,
      });

    } catch (error) {
      console.error(
        "UPDATE ORDER STATUS ERROR:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          "Unable to update order status",

        error:
          error.message,
      });
    }
  };