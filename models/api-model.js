
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const apiSchema = new Schema({
  name: String,
  url: String,
  method: String,
  scenarios: [Object]
})
const ApiModel = mongoose.model('Api', apiSchema);
module.exports = ApiModel;