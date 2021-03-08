const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator'); // we use this as a mongoose plugin (adds hook to check the data before DB save is executed)

const userSchema = mongoose.Schema({
    email: {type: String, require: true, unique: true}, // unique does internal mongoose optimization it isn't a validator like required
    password: {type: String, required: true}
});

userSchema.plugin(uniqueValidator); // same email error will be thrown now

module.exports = mongoose.model('User', userSchema);
