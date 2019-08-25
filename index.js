const http = require("http");
var url = require("url");
const { parse } = require('querystring');
const promisify = require("util").promisify;

const port = 3000;
const host = "localhost";

const server = http.createServer((req, res) => {
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/plain");
    res.end("Hello World");
})

server.listen(port, host, () => {
    console.log(`Server running at http://${host}:${port}/`);
});