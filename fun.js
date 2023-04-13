const { pbkdf2 } = require('crypto');

const fetch = require("node-fetch");

const chalk = require('chalk');




//!--------------------------------------->
//!           BOARDS PROTOTIP           -->
//!--------------------------------------->
module.exports.board1 = async (msg, boards) => {

    console.log(`doard 1`)
    for (let j = boards.length - 1; j >= 0; j--) {
        if (boards[j].board == "1") boards[j].send(JSON.stringify(msg))
    }

}