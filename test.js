let obj1 = {
    "name": "Emmanuel",
    "faculty": "Engineering",
    "department": "Electrical/Electronics Engineering",
    "level": 400
}

let obj2 = {
    name: "Emma",
    level: 100,
    n: "kl"
}

function update(data = {}, body = {}) {
    for (key of Object.keys(body)) {
        if (!data.hasOwnProperty(key)) return console.log("invalid update")
    }
    
    for (key of Object.keys(body)) {
        data[key] = body[key];
    }

    console.log("all done", data, body);
}

update(obj1, obj2);