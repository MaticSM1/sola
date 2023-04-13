const mongoose = require('mongoose');
const Neteowrite = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    typeUSER: {
        type: Number,
        default: 0
    },
    idDIS: {
        type: String,
        default: 0
    },
    token: {
        type: String,
        default: 0
    },
    acc: {
        type: Array,
        default: 0
    },
    pfp:{
        type: String,
        default: 0
    },
    boards:{
        type: Array,
        default: []
    }
});
const User = mongoose.model('neteowrite', Neteowrite);

module.exports = User;