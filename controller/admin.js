const catchAsyncError = require("../utils/catchAsyncError");
const ErrorHandler = require("../utils/ErrorHandler");
const User = require("./../models/User");
const getUsers = catchAsyncError(async (req, res, next) => {
  const queryp = req.query;
  const query = User.find();
  const page = queryp.page && query.page > 0 ? query.page : 1;
  const docs = await query
    .skip((page - 1) * 15)
    .limit(15)
    .sort();
  if (docs) {
    return res.send({
      success: true,
      data: docs,
    });
  }
  next(new ErrorHandler("documents cann't be found", 500));
});
const getUser = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (user) {
    res.send({
      success: true,
      data: user,
    });
  } else {
    next(new ErrorHandler("user not found", 404));
  }
});
const unSuspendUser = catchAsyncError(async (req, res, next) => {
  const doc = await User.findByIdAndUpdate(req?.params?.id, {
    suspended: false,
  });
  if (doc) {
    return res.send({
      success: true,
    });
  }
  next(new ErrorHandler("user not found", 404));
});
const suspendUser = catchAsyncError(async (req, res, next) => {
  const doc = await User.findByIdAndUpdate(req?.params?.id, {
    suspended: true,
  });
  if (doc) {
    return res.send({
      success: true,
    });
  }
  next(new ErrorHandler("user not found", 404));
});
const deleteUser = catchAsyncError(async (req, res, next) => {
  const doc = await User.findOneAndDelete(req.params.id);
  if (doc) {
    return res.send({
      success: true,
    });
  }
  next(new ErrorHandler("user not found", 404));
});
module.exports = { getUsers, getUser, unSuspendUser, suspendUser, deleteUser };
