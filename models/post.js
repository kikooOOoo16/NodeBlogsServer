const mongoose = require('mongoose');

const postSchema = mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    imageUrl: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', require: true }
});

module.exports = mongoose.model('Post', postSchema);
