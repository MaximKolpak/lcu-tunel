const fs = require('fs');
const { networkInterfaces } = require('os');

const nets = networkInterfaces();
const results = Object.create(null); // Or just '{}', an empty object
const fileOptions = './config.json';


let options = {
    ip   : '127.0.0.1',
    port : 8080,
    interval: 5000
}


try{
    let buf = fs.readFileSync(fileOptions);
    options = JSON.parse(buf.toString());
}catch{
    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
            if (net.family === 'IPv4' && !net.internal) {
                if (!results[name]) {
                    results[name] = [];
                }
                results[name].push(net.address);
            }
        }
    }

    options.ip = results["en0"][0];

    fs.writeFileSync(fileOptions, JSON.stringify(options));
}

module.exports = options