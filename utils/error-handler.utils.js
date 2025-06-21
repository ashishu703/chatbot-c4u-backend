const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, msg: "Something went wrong" });
};

module.exports = errorHandler;
