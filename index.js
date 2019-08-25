const http = require("http");
var url = require("url");
const { parse } = require("querystring");
const promisify = require("util").promisify;
const fs = require("fs");
const open = promisify(fs.open);
const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);
const close = promisify(fs.close);

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
    let body = ""

    req.on("data", chunk => {
        body += chunk.toString();
    });

    req.on("end", () => {
        let fd;
        body = JSON.parse(body);
        open(`./.data${req.url}.json`, 'r+')
        .then(fileDescriptor => {
            fd = fileDescriptor
            return readFile(fd, "utf-8")
        })
        .then(data => {
            data = JSON.parse(data);
            data[(Object.keys(data).length + 1) + ""] = body;
            var stringData = JSON.stringify(data, null, "\t");
            console.log(stringData);
            return writeFile(fd, stringData);
        })
        .then(() => {
            return close(fd);
        })
        .then(() => {
            res.statusCode = 200;
            res.setHeader("Content-Type", "text/plain");
            res.end(JSON.stringify(body, null, "\t"));
        })
        .catch(err => {
            res.statusCode = 404;
            res.setHeader("Content-Type", "text/plain");
            res.end(err.message)
            console.log(err);
        })
    })
}

// Using callbacks without making a promise
// function handlePOST(req, res) {
//     let body = ""
//     req.on("data", chunk => {
//         body += chunk.toString();
//     });
//     req.on("end", () => {
//         body = JSON.parse(body);
//         fs.open(`./.data${req.url}.json`, 'r+', (err, fileDescriptor) => {
//             if (err) {
//                 res.statusCode = 404;
//                 res.setHeader("Content-Type", "text/plain");
//                 res.end(err.message)
//                 return console.log(err);
//             } 
//             fs.readFile(fileDescriptor, "utf-8", (err, data) => {
//                 data = JSON.parse(data);
//                 data[(Object.keys(data).length + 1) + ""] = body;
//                 var stringData = JSON.stringify(data, null, "\t");
//                 console.log(stringData);
//                 fs.writeFile(fileDescriptor, stringData, function (err) {
//                     if (!err) {
//                         fs.close(fileDescriptor, function (err) {
//                             if (!err) {
//                                 console.log(false);
//                             } else {
//                                 console.log("Error closing file");
//                             }
//                         })
//                     } else {
//                         console.log("Error updating file");
//                     }
//                     res.statusCode = 200;
//                     res.setHeader("Content-Type", "text/plain");
//                     res.end(JSON.stringify(body, null, "\t"));
//                 })
//             })
//         })
//     })
// }

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