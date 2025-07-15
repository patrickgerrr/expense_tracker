const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
    },
    username: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: () => new Date()
    },
    // role:{
    //     type:String,
    //     enum: ['admin', 'user'],
    //     default: 'user',
    // },
    balance: {
        type: Number,
        default: 0
    },

    encryptionKey: {
        type: Buffer,
        default: ()=>require("crypto").randomBytes(32)
    }

    //commented out roles as that would make it too complicated
    //also it would be better to implement amount in another schema
})

const User = mongoose.model("user", userSchema);

module.exports = User;