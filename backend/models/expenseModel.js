const mongoose = require('mongoose')

const expenseSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },

    date: {
        type: Date,
        default: () => new Date()
    },

    title: {
        type: String,
        required: true
    },

    amount: {
        type: Number,
        required: true
    },

    category: {
        type: String,
        // enum: ['groceries','medical','personal', 'bills', 'transport', 'entertainment', 'other'],
        required: true
    },

    note: {
        type: String
    }


})

module.exports = mongoose.model("expenses",expenseSchema)