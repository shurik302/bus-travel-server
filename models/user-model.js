const { Schema, model } = require("mongoose");

const UserSchema = new Schema({
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true }, // Убедитесь, что пароль хешируется перед сохранением
    isActivated: { type: Boolean, default: false },
    activationLink: { type: String },
    role: { type: String, default: "user" },
});

module.exports = model("User", UserSchema);
