const catchAsyncError = require("../utils/catchAsyncError");
const ErrorHandler = require("../utils/ErrorHandler");
const User = require("./../models/User");
const getUsers = catchAsyncError(async (req, res, next) => {
  const query = req.query;
  let userQuery = User.find();
  if (query.search) {
    const keyword = String(query.search);
    const option = "im";
    userQuery = userQuery.where({
      $or: [
        { firstName: { $regex: keyword, $options: option } },
        { lastName: { $regex: keyword, $options: option } },
      ],
    });
  }
  if (query.userType) {
    if (query.userType == "Admin") {
      //customer user
      userQuery = userQuery.where({
        isAdmin: true,
      });
    } else if (query.userType == "Customer") {
      //
      userQuery = userQuery.where({
        isAdmin: false,
      });
    }
    const keyword = query.search;
    const option = "im";
    userQuery = userQuery.where({
      $or: [
        // { placeDescription: { $regex: keyword, $options: option } },
        { firstName: { $regex: keyword, $options: option } },
        { lastName: { $regex: keyword, $options: option } },
      ],
    });
  }
  const page = query.page && query.page > 0 ? query.page : 1;
  const docs = await userQuery
    .skip((page - 1) * 5)
    .where({
      _id: { $ne: req.query.id },
    })
    .limit(5)
    .sort();
  if (docs) {
    return res.send(docs);
  }
  next(new ErrorHandler("documents cann't be found", 500));
});
const getUser = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.params.id).select("+phoneNumber");
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
