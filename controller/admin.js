const catchAsyncError = require("../utils/catchAsyncError");
const ErrorHandler = require("../utils/ErrorHandler");
const User = require("./../models/User");
const getUsers = catchAsyncError(async (req, res, next) => {
  const query = req.query;
  const userQuery = User.find();
  const page = query.page && query.page > 0 ? query.page : 1;
  const docs = await userQuery
    .skip((page - 1) * 5)
    .limit(5)
    .sort();
  if (docs) {
    return res.send(docs);
  }
  next(new ErrorHandler("documents cann't be found", 500));
});
const getUser = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (user) {
    res.send(user);
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
