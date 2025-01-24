const mongoose = require("mongoose");

const ObjectId = mongoose.Schema.Types.ObjectId;

function validateId(id) {
  return mongoose.isValidObjectId(id);
}

module.exports = {
  ObjectId,
  validateId,
};
