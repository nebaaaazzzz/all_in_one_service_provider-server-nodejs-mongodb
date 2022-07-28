const upload = require("../../config/fileHandler");
const route = require("express").Router();
const validator = require("validator").default;
const House = require("./../../models/House");
const User = require("./../../models/User");
const ErrorHandler = require("../../utils/ErrorHandler");
route.post(
  "/posthouse",
  upload.array("houseImage", 20),
  async (req, res, next) => {
    if (req.user?.left > 0) {
      const obj = JSON.parse(req.body.body);
      obj.houseImages = req.files.map((file) => file.id);
      obj.price = Number(obj.price);
      obj.location = { coordinates: obj.center };
      delete obj.center;
      await House.create({ ...obj, user: req.user.id });
      await User.findByIdAndUpdate(req.user.id, {
        left: req.user.left - 1,
      });
      return res.status(201).send({
        success: true,
      });
    }
    next(new ErrorHandler("please py", 400));
  }
);
route.post("/edit-post/:id", async (req, res, next) => {
  if (validator.isMongoId(req.params.id)) {
    const house = await House.findById(req.params.id);
    if (house) {
      await house.updateOne(req.body);
      return res.send();
    }
  }
  return next(new ErrorHandler("house not found", 404));
});

route.get("/house/:id", async (req, res, next) => {
  if (validator.isMongoId(req.params.id)) {
    const house = await House.findById(req.params.id);
    if (house) {
      return res.send({
        success: true,
        data: house,
      });
    }
  }
  return next(new ErrorHandler("house not found", 404));
});
route.get("/posts", async (req, res) => {
  let page = req?.query?.page;
  page = page > 1 ? page : 1;
  const pageSize = 5;

  const query = House.find({ user: req.user.id });
  const houses = await query
    .sort({ createdAt: -1 })
    .limit(pageSize)
    .skip(pageSize * (page - 1));
  res.send(houses);
});
route.get("/applicants/:id", async (req, res, next) => {
  if (validator.isMongoId(req.params.id)) {
    const house = await House.findById(req.params.id);
    if (house) {
      if (house.applicants) {
        let page = req?.query?.page;
        page = page > 1 ? page : 1;
        const pageSize = 5;
        const skip = pageSize * (page - 1);
        const limit = skip + pageSize;
        const applicants = house.applicants.slice(skip, limit);
        const docs = await User.find({ _id: { $in: applicants } });
        return res.send(docs);
      }
      return res.send([]);
    }
  }
  next(new ErrorHandler("house not found", 404));
});
route.get("/approved/:id", async (req, res, next) => {
  if (validator.isMongoId(req.params.id)) {
    const house = await House.findById(req.params.id);
    if (house) {
      if (house.approved) {
        let page = req?.query?.page;
        page = page > 1 ? page : 1;
        const pageSize = 5;
        const skip = pageSize * (page - 1);
        const limit = skip + pageSize;
        const approved = house.approved.slice(skip, limit);
        const docs = await User.find({ _id: { $in: approved } });
        return res.send(docs);
      }
      return res.send([]);
    }
  }
  next(new ErrorHandler("house not found", 404));
});
route.get("/rejected/:id", async (req, res, next) => {
  if (validator.isMongoId(req.params.id)) {
    const house = await House.findById(req.params.id);
    if (house) {
      if (house.rejected) {
        let page = req?.query?.page;
        page = page > 1 ? page : 1;
        const pageSize = 5;
        const skip = pageSize * (page - 1);
        const limit = skip + pageSize;
        const rejected = house.rejected.slice(skip, limit);
        const docs = await User.find({ _id: { $in: rejected } });
        return res.send(docs);
      }

      return res.send([]);
    }
  }
  next(new ErrorHandler("house not found", 404));
});
route.get("/approve/:houseId/:userId", async (req, res, next) => {
  if (
    validator.isMongoId(req.params.houseId) &&
    validator.isMongoId(req.params.userId)
  ) {
    const user = await User.findById(req.params.userId);
    const house = await House.findById(req.params.houseId);
    if (user && house) {
      if (house.applicants.length) {
        const applicants = house.applicants;
        const bool = applicants.includes(req.params.userId);
        if (bool) {
          await house
            .UpateOne({
              $addToSet: { approved: req.params.userId },
            })
            .updateOne({
              $pull: { votes: { $eq: req.params.userId } },
            });
        } else {
          return next("user not applied", 404);
        }
      }
    }
    return next(("no one applied", 404));
  }
  next(new ErrorHandler("user or house not found", 404));
});
route.get("/reject/:houseId/:userId", async (req, res, next) => {
  if (
    validator.isMongoId(req.params.houseId) &&
    validator.isMongoId(req.params.userId)
  ) {
    const user = await User.findById(req.params.userId);
    const house = await House.findById(req.params.houseId);
    if (user && house) {
      if (house.applicants.length) {
        const applicants = house.applicants;
        const bool = applicants.includes(req.params.userId);
        if (bool) {
          await house
            .UpateOne({
              $addToSet: { rejected: req.params.userId },
            })
            .updateOne({
              $pull: { votes: { $eq: req.params.userId } },
            });
        } else {
          return next("user not applied", 404);
        }
      }
      return next(("no one applied", 404));
    }
  }
  next(new ErrorHandler("user or house not found", 404));
});
route.get("/:houseId/:userId", async (req, res, next) => {
  if (
    validator.isMongoId(req.params.houseId) &&
    validator.isMongoId(req.params.userId)
  ) {
    const house = await House.findById(req.params.houseId);
    const user = await User.findById(req.params.userId);
    if (house && user) {
      if (house.applicants.length) {
        const bool = house.applicants.includes(req.params.userId);
        if (bool) {
          const result = user.toObject();
          result.applied = true;
          return res.send(result);
        }
      }
      if (house.approved.length) {
        const bool = house.approved.includes(req.params.userId);
        if (bool) {
          const result = user.toObject();
          result.approved = true;
          return res.send(result);
        }
      }
      if (house.rejected.length) {
        const bool = house.approved.includes(req.params.userId);
        if (bool) {
          const result = user.toObject();
          result.rejected = true;
          return res.send(result);
        }
      }
      return res.send(user);
    }
  }
  return next(new ErrorHandler("house and users not found", 404));
});
module.exports = route;
