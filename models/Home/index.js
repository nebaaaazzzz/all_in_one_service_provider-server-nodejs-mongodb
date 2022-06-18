const mongoose = require("mongoose");
const homeSchema = new mongoose.Schema({}, { timestamps: true });

module.exports = mongoose.model("Home", homeSchema);
