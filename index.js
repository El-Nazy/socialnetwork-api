const http = require("http");
const url = require("url");
const { parse } = require("querystring");
const promisify = require("util").promisify;
const fs = require("fs");
const open = promisify(fs.open);
const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);
const close = promisify(fs.close);
const unlink = promisify(fs.unlink);
const readdir = promisify(fs.readdir);

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
        let lastID;
        let fd;
        readFile(`./.data${req.url}/lastID.txt`, "utf-8")
        .then(data => {
            lastID = Number(data);
            return open(`./.data${req.url}/${++lastID}.json`, 'wx+')
        })
        .then(fileDescriptor => {
            fd = fileDescriptor
            writeFile(`./.data${req.url}/lastID.txt`, lastID);
            return writeFile(fd, body);
        })
        .then(() => {
            res.statusCode = 200;
            res.setHeader("Content-Type", "text/plain");
            res.end(`User created with id = ${lastID}`);
            close(fd);
        })
        .catch(err => {
            res.statusCode = 404;
            res.setHeader("Content-Type", "text/plain");
            res.end("Invalid request")
            console.log(err);
        })
    })
}

function handleGET(req, res) {
    let fd;
    if (req.url == "/students"){
        const dir = './.data/students';

        readdir("./.data/students")
        .then(files => {
            let responseBody = ""
            for (file of files) {
                if (file == "lastID.txt") continue;
                data = fs.readFileSync(`./.data/students/${file}`, "utf-8")
                console.log("in here")
                responseBody += `id = ${file.split(".")[0]} : ${data}\n`;
                console.log(data);
                console.log(`./.data/students/${file}`, typeof file);
            }
            console.log(responseBody)
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.end(responseBody);
        });
        return;
    }
    open(`./.data${req.url}.json`, 'r+')
    .then(fileDescriptor => {
        fd = fileDescriptor
        return readFile(fd, "utf-8")
    })
    .then(data => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.end(data);
        console.log(data);
        close(fd);
    })
    .catch(err => {
        res.statusCode = 404;
        res.setHeader("Content-Type", "text/plain");
        res.end("Not found")
        console.log(err);
    })
}

function handlePUT(req, res) {
    let body = ""

    req.on("data", chunk => {
        body += chunk.toString();
    });

    req.on("end", () => {
        let fd;
        body = parsejsonObject(body);
        open(`./.data${req.url}.json`, 'r+')
        .then(fileDescriptor => {
            fd = fileDescriptor
            return readFile(fd, "utf-8")
        })
        .then(data => {
            data = parsejsonObject(data);
            // Check if the property-names of Object sent tally with Object requested
            for (key of Object.keys(body)) {
                if (!data.hasOwnProperty(key)) {
                    res.statusCode = 400;
                    res.setHeader("Content-Type", "text/plain");
                    res.end(`Invalid property name "${key}"`);
                    return;
                    // console.log(err);
                    // throw new Error(`Invalid property name "${key}"`);
                }
            }
            
            // Update all properties of data with values from PUT request body
            for (key of Object.keys(body)) {
                data[key] = body[key];
            }
            
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
            res.end(`Successfully updated user with id = ${req.url.split("/")[2]}`);
        })
        .catch(err => {
            res.statusCode = 404;
            res.setHeader("Content-Type", "text/plain");
            res.end("Invalid PUT request")
            console.log(err);
        })
    })
}

function handleDELETE(req, res) {
    unlink(`./.data${req.url}.json`)
    .then(() => {
        let id = req.url.split("/")[2];
        res.statusCode = 200;
        res.setHeader("Content-Type", "text/plain");
        res.end(`Successfully deleted user with id = ${id}`);
    })
    .catch(err => {
        res.statusCode = 404;
        res.setHeader("Content-Type", "text/plain");
        res.end("Student not found or invalid request");
        console.log(err);
    })
}

function parsejsonObject (str){
    try {
        var obj = JSON.parse(str);
        return obj;
    } catch (error) {
        return {}
    }
}