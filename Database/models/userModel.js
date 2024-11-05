const mongoose = require('mongoose');
const bcrypt = require("bcryptjs");

const userSchema = mongoose.Schema(
    {
        username: {
            type: String,
            required: [true, 'User Name is required'],
            minlength: [3, 'User name must be at least 3 characters'],
            maxlength: [25, 'User name must be at most 25 characters']
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            lowercase: true,
            unique: true
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
            minlength: [6, 'Password must be at least 6 characters']
        },
        passwordChangedAt: {
            type: Date,
        },
        passwordResetCode: {
            type: String,
        },
        passwordResetExpires: {
            type: Date,
        },
        passwordResetVerified: {
            type: Boolean,
           
        },
    },
    { timestamps: true }
);

userSchema.pre("save", async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

module.exports = mongoose.model('User', userSchema);
