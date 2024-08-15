const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Base User Schema
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ["admin", "teacher", "student", "parent"],
        required: true,
    },
    profile: {
        name: { type: String, required: true },
        dateOfBirth: { type: Date },
        gender: { type: String, enum: ["Male", "Female", "Other"] },
        phone: { type: String },
        address: { type: String },
        profileImage: { type: String },  // Add profileImage here
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
}, { discriminatorKey: 'role', collection: 'users' });

// Pre-save hook to hash the password before saving
userSchema.pre("save", async function (next) {
    if (!this.isModified("password") || this.password.startsWith('$2b$')) {
        return next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Base User model
const User = mongoose.model("User", userSchema);

module.exports = User;
