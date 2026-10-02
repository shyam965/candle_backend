import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDb from "./config/db.js";

import categoryRouter from "./routes/categoryRoutes.js";
import productRouter from "./routes/productRoutes.js";
import orderRouter from "./routes/order.routes.js";
import authRouter from "./routes/auth.routes.js";
import cartRouter from "./routes/cart.routes.js";
import cookieParser from "cookie-parser";
import path from "path";

import bannerRouter from "./routes/banner.routes.js";
import promoCardRouter from "./routes/promoCard.routes.js";

const app = express();

dotenv.config();

app.use(cookieParser());

connectDb();

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

// Uploaded images ko publicly serve karega
// app.use(
//   "/uploads",
//   express.static(path.join(process.cwd(), "uploads"))
// );

app.use("/uploads", express.static("uploads"));

app.get("/", (_, res) => {
  res.json({ msg: "api is working" });
});


app.use("/api/category", categoryRouter);
app.use("/api/product", productRouter);

app.use(
  "/api/auth",
  authRouter
);
app.use(
  "/api/order",
  orderRouter
);

app.use(
  "/api/cart",
  cartRouter
);

app.use("/api/banner", bannerRouter);

app.use("/api/promo-card", promoCardRouter);




const port = process.env.PORT || 9000;

app.listen(port, () =>
  console.log(`server started on port ${port}`)
);