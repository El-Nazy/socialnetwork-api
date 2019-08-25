const http = require("http");
var url = require("url");
const { parse } = require('querystring');
const promisify = require("util").promisify;

const port = 3000;
const host = "localhost";

const CRUD_Handlers = {
    POST: handlePOST,
    GET: handleGET,
    PUT: handlePUT,
    DELETE: handleDELETE 
};

const server = http.createServer((req, res) => {
    if (Object.keys(CRUD_Handlers).includes(req.method)) {
        CRUD_Handlers[req.method.toUpperCase()](req, res);
    }else{
        res.statusCode = 405;                                                                       
        res.setHeader("Content-Type", "text/plain");
        res.end(`${req.method} requests are not allowed`);
    }
})

server.listen(port, host, () => {
    console.log(`Server running at http://${host}:${port}/`);
});

function handlePOST(req, res) {
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/plain");
    res.end("You made a POST request");
}

function handleGET(req, res) {
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/plain");
    res.end("You made a GET request");
}

function handlePUT(req, res) {
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/plain");
    res.end("You made a PUT request");
}

function handleDELETE(req, res) {
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/plain");
    res.end("You made a DELETE request");
}