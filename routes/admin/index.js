const route = require("express").Router();
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
route.delete("/user/:id", deleteUser);
route.patch("/user/:id/suspend", suspendUser);
route.patch("/user/:id/unsuspend", unSuspendUser);
route.post("/add-user", registerUser);
route.post("/validate", validateUserAccount);
route.patch("/user-udate/:id", async (req, res) => {});
module.exports = route;
