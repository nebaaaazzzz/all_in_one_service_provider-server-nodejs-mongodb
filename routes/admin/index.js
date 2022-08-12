const route = require("express").Router();
const Job = require("./../../models/Job");
const House = require("./../../models/House");
const Feedback = require("../../models/Feedback");
const {
  getUsers,
  getUser,
  suspendUser,
  unSuspendUser,
  deleteUser,
} = require("../../controller/admin");
const {
  registerUser,
  validateUserAccount,
} = require("../../controller/authController");

route.get("/users", getUsers);
route.get("/user/:id", getUser);
route.patch("/user/:id/suspend", suspendUser);
route.patch("/user/:id/unsuspend", unSuspendUser);
route.get("/house/posts", async (req, res) => {
  const query = req.query;
  const houseQuery = House.find();
  const page = query.page && query.page > 0 ? query.page : 1;
  const docs = await houseQuery
    .skip((page - 1) * 5)
    .where({ deleted: false })
    .limit(5)
    .sort({
      createdAt: -1,
    });
  if (docs) {
    return res.send(docs);
  }
  next(new ErrorHandler("houses cann't be found", 500));
});
route.get("/feedback", async (req, res) => {
  const query = req.query;
  const feedbackQuery = Feedback.find().populate("user");
  const page = query.page && query.page > 0 ? query.page : 1;
  const docs = await feedbackQuery
    .skip((page - 1) * 5)
    .limit(5)
    .sort({
      createdAt: -1,
    });
  if (docs) {
    return res.send(docs);
  }
  next(new ErrorHandler("houses cann't be found", 500));
});
route.get("/house/post/:id", async (req, res) => {
  const house = await House.findById(req.params.id);

  if (house) {
    return res.send(house);
  }
  next(new ErrorHandler("house not  found", 404));
});
route.patch("/house/post/:id", async (req, res) => {
  const house = await House.findById(req.params.id);
  if (house) {
    return res.send(house);
  }
  next(new ErrorHandler("house not  found", 404));
});
route.patch("/house/approve/:id", async (req, res) => {
  const house = await House.findById(req.params.id);
  if (house) {
    await house.updateOne({
      isApproved: 1,
    });
    return res.send({ success: true });
  }
  next(new ErrorHandler("job not  found", 404));
});
route.patch("/house/reject/:id", async (req, res) => {
  const house = await House.findById(req.params.id);
  if (house) {
    await house.updateOne({
      isApproved: 2,
    });
    return res.send({ success: true });
  }
  next(new ErrorHandler("job not  found", 404));
});
route.get("/job/posts", async (req, res) => {
  const query = req.query;
  const jobQuery = Job.find();
  const page = query.page && query.page > 0 ? query.page : 1;
  const docs = await jobQuery
    .skip((page - 1) * 5)
    .limit(5)
    .where({ deleted: false })

    .sort({
      createdAt: -1,
    });
  if (docs) {
    return res.send(docs);
  }
  next(new ErrorHandler("Jobs cann't be found", 500));
});
route.get("/job/post/:id", async (req, res) => {
  const job = await Job.findById(req.params.id);

  if (job) {
    return res.send(job);
  }
  next(new ErrorHandler("job not  found", 404));
});
route.patch("/job/approve/:id", async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (job) {
    await job.updateOne({
      isApproved: 1,
    });
    return res.send({ success: true });
  }
  next(new ErrorHandler("job not  found", 404));
});
route.patch("/job/reject/:id", async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (job) {
    await job.updateOne({
      isApproved: 2,
    });
    return res.send({ success: true });
  }
  next(new ErrorHandler("job not  found", 404));
});

// route.delete("/user/:id", deleteUser);
// route.post("/add-user", registerUser);
// route.post("/validate", validateUserAccount);
// route.post("/validate", validateUserAccount);
module.exports = route;
