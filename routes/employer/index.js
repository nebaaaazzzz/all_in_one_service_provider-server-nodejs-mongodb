const route = require("express").Router();
const Job = require("./../../models/Job");
const upload = require("../../config/fileHandler");
const bucket = require("../../config/db");

route.post("/postjob", upload.single("document"), async (req, res) => {
  const obj = JSON.parse(req.body.body);
  obj.document = req?.file?.id;
  if (obj.salary) {
    obj.salary = Number(obj.price);
  }
  if (obj.budget) {
    obj.budget.from = Number(obj.budget.from);
    obj.budget.to = Number(obj.budget.to);
  }
  obj.location = { type: "Point", coordinates: obj.center };
  delete obj.center;
  await Job.create({ ...obj, user: req.user.id });
  res.status(201).send({
    success: true,
  });
});
route.get("/job/:id", async (req, res, next) => {
  const job = await Job.findById(req.params.id);
  if (!job) {
    return next(new ErrorHandler("house not found", 404));
  }
  res.send({
    success: true,
    data: job,
  });
});
route.get("/posts", async (req, res) => {
  let page = req?.query?.page;
  page = page > 1 ? page : 1;
  const pageSize = 5;
  const query = Job.find({ id: req.user.id });
  const jobs = await query
    .sort({ createdAt: 1 })
    .limit(pageSize)
    .skip(pageSize * (page - 1));
  res.send(jobs);
});

route.patch("/update-job/:id", async (req, res) => {});
route.post("/approve-user", async (req, res) => {});
module.exports = route;
