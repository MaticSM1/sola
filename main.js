const express = require('express');
const mongoose = require('mongoose');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require("passport");
const https = require("https");
const fs = require("fs");
const ms = require('ms')
const sleep = time => new Promise(resolve => setTimeout(resolve, ms(time)));
const WebSocketServer = require("websocket").server;
const { request } = require('http');
let connection = null;
const WebSocketServer2 = require('ws').Server;
const fileUpload = require("express-fileupload");
const path = require("path");
const fun = require('./fun')
const cors = require('cors')
const chalk = require('chalk');

const app = express();
const http = require('http')

//passport config:
require('./config/passport')(passport)
let nastavitveZazeniBrezMongo = false


//! NASTAVITVE:
//* zazeni brez mongota
//nastavitveZazeniBrezMongo = true


//mongoose
if (nastavitveZazeniBrezMongo == true) console.log(chalk.yellow('[START]  Zaganjam brez MONGO-ta'))
let cooldown = ms('3s')
let mongoON = false
let mongoNeDela = false
setInterval(async () => {
    if (!mongoON && !nastavitveZazeniBrezMongo) {
        mongoose.connect(--ODSTRANJENO--)
            .then(() => {
                if (!mongoNeDela) console.log(chalk.green('[START]  connected to MONGO'))
                mongoON = true
                cooldown = ms('23h')
            })
            .catch((err) => {
                //console.log(err)
                mongoNeDela = true
                console.log(chalk.red('[START]  Povezovanje na MONGO neuspesno'))
            });
        cooldown = ms('3min')
        console.log(chalk.yellow('[START]  Popravljam MONGO'))
    }
}, cooldown)

app.use(cors({
    origin: '*',
}))

// PUBLIC
app.use(express.static('public'));


// proxy
//app.use('/proxy', proxy('http://192.168.1.155:8090'));


//EJS
app.set('view engine', 'ejs');
app.use(express.json())
//BodyParser
app.use(express.urlencoded({ extended: false }));
//express session
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));
app.use(fileUpload({ createParentPath: true, }));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
})

//Ruter
let link1 = require('./routes/index')
app.use('/', link1);




//! HTTP
app.listen(8050);


//! HTTPS
const options = {
    key: fs.readFileSync('ssl/private.key'), // --odstranjeno v javni verziji--
    cert: fs.readFileSync('ssl/certificate.crt'), // --odstranjeno v javni verziji--
    ca: fs.readFileSync('ssl/ca_bundle.crt') // --odstranjeno v javni verziji--
};

let httpsServer = https.createServer(options, app)
    .listen(3443, function () {
        console.log(chalk.green("[START]  https server on 3443"))
    })


//! socket
const httpserver = http.createServer({})
httpserver.listen(8070)

const websocket = new WebSocketServer({ "httpServer": httpserver })
const wss = new WebSocketServer2({ server: httpsServer, path: '/echo' });

let povezave = []
let intervalIndex = 0



//todo  LOOP ZA BRISANJE
let wsCooldown = ms('30s')
if (intervalIndex == 0) {
    setInterval(async () => {
        //fun.ws_odstrani(povezave)
    }, wsCooldown)
    intervalIndex = 1
}


websocket.on("request", request => {


    //todo  USTVARI NOVO POVEZAVO
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    }

    //todo  SE POVEŽE
    connection = request.accept(null, request.origin)
    connection.id = s4() + s4() + '-' + s4()
    connection.ura = (new Date() - 1)
    connection.urastart = (new Date() - 1)
    povezave.push(connection)
    connection.send(`{"key":"${connection.id}"}`)
    // fun.ws_wslist_posodobi(povezave)

    //todo  OBDELAVA SPOROCIL
    connection.on("start", () => console.log("[WS] nova ws povazava"))
    connection.on("close", () => console.log("[WS] povezava prekinjena"))
    connection.on("message", message => {

        let msg = JSON.parse(message.utf8Data)
        //console.log(msg)
        for (let i = 0; i < povezave.length; i++) {
            if (povezave[i].id == msg.kljuc) {
                povezave[i].ura = (new Date() - 1)
                if (!povezave[i].board && msg.board) {
                    povezave[i].board = msg.board
                    fun.board1(msg, povezave)
                    console.log(`[WS] board: ${povezave[i].board}`)
                } else if (!povezave[i].board) povezave[i].send('{"msg":"ni_programa"}')
                else {

                    if (povezave[i].board) {

                        if (povezave[i].board == "1") fun.board1(msg, povezave)
                        else if (povezave[i].board == "2") fun.board1(msg, povezave)
                        else if (povezave[i].board == "3") fun.board1(msg, povezave)

                    }
                }
            }
        }
    })
})






//! socket io

/*
const socketio = require('socket.io')
const server = http.createServer(app)
server.listen(8077, () => {
    console.log(`Socket.IO server running at http://localhost:8077/`);
});
const io = socketio(server)


io.on('connection', (socket) => {
    console.log("novi socket")
    //io.send("dober dan")

    socket.on("open", () => console.log("odprto"))
    socket.on("close", () => console.log("zaprto"))
    socket.on("message", message => { console.log(message) })


    socket.on('chat message', msg => {
        io.emit('chat message', msg);
    });
});
*/



//! NE OBSTAJA

app.get('*', function (req, res) {
    console.log("ne obstaja")
    res.status(404).send('PAGE NOT FOUND ;(    <br><a href="/">WRITE WEB</a>');
});
