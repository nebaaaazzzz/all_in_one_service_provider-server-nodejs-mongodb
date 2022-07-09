const mongoose = require("mongoose");
const transactionSchema = new mongoose.Schema({});

const TransactionModel = mongoose.model("Transaction", transactionSchema);
module.exports = TransactionModel;
