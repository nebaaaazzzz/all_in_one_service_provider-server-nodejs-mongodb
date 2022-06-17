const router = require("express").Router();
const Job = require("./../../models/Job");
router.post("/post-job", async (req, res) => {
  const job = await Job.create({ ...req.body, user: req.user.id });
  if (job) {
    res.status(201).send({
      success: false,
      data: job,
    });
  }
  res.status(400).send({
    sucess: false,
    error: new Error("invalid info"),
  });
});
router.patch("/update-job/:id", async (req, res) => {});
router.post("/approve-user", async (req, res) => {});
module.exports = router;
