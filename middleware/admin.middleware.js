const adminMiddleware = (
  req,
  res,
  next
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Please login first",
      });
    }

    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
      });
    }

    next();
  } catch (error) {
    console.log(
      "Admin middleware error:",
      error.message
    );

    return res.status(403).json({
      success: false,
      message: "Access denied",
    });
  }
};

export default adminMiddleware;