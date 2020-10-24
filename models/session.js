var mongoose = require("mongoose");

var sessionSchema = new mongoose.Schema({
    users: { type: Number, required: true, default: 1 },
    nicknames: { type: Array },
    messages: {
        type: Array
    },
    _id: { type: String, required: true },
    content: { type: String, required: false },

});

module.exports = mongoose.model("Session", sessionSchema);