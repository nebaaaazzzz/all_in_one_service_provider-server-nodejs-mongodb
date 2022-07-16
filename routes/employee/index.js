const route = require("express").Router();
const Job = require("../../models/Job");

route.get("/", async (req, res, next) => {
  const query = req.query;
  const jobQuery = Job.find();
  const page = query.page > 1 ? query.page : 1;
  const size = 5;
  const jobs = await jobQuery.skip((page - 1) * size).limit(size);
  res.send(jobs);
  // .where({ price: { $gte: 21, $lte: 65 } })
  // .where({ placetype: "full" })
  // .where({ bedrooms: 3 })
  // .where({ bathroom: 3 })
  // .where({ propertype: "hotel" }) /*house ,apartment ,guesthouse ,hotel */
  // .where({
  //   amenalities: "wifi kitchen washer dryer air-conditioning heating tv",
  // }); /*essential -wifi kitchen washer dryer air-conditioning heating tv*/
  /*features -pool hottube parking gym smoking-allowed heating tv*/
  /*who is comming -adults(13>) children(2-12) infant(<2) pets*/
  /*where - city */
});
route.get("/job/:id", async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) {
    return next(new ErrorHandler("house not found", 404));
  }
  res.send({
    success: true,
    data: job,
  });
});
route.post("/apply-job", (req, res) => {});
module.exports = route;
