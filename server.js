const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const dgram = require("dgram");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const udpServer = dgram.createSocket("udp4");

const UDP_PORT = 20777;
const WEB_PORT = 3000;

app.use(express.static(path.join(__dirname, "public")));

udpServer.on("message", (msg) => {

    // VERY simplified parsing
    // Real F1 packets are much larger
    // This grabs some common telemetry bytes

    try {

        const speed = msg.readUInt16LE(50);
        const throttle = msg.readUInt8(70);
        const brake = msg.readUInt8(71);
        const gear = msg.readInt8(72);
        const rpm = msg.readUInt16LE(74);

        io.emit("telemetry", {
            speed,
            throttle,
            brake,
            gear,
            rpm
        });

    } catch (err) {
        console.log("Packet parse error");
    }
});

udpServer.bind(UDP_PORT, () => {
    console.log(`UDP listening on ${UDP_PORT}`);
});

io.on("connection", () => {
    console.log("Browser connected");
});

server.listen(WEB_PORT, () => {
    console.log(`Website running at http://localhost:${WEB_PORT}`);
});
