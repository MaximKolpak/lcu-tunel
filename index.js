const http = require('http');
const https = require('https');
const fs = require('fs');
const crypto = require('crypto');
const util = require('node:util');
const options = require('./options');


const pathlockfile = '/Applications/League of Legends.app/Contents/LoL/lockfile';

const lf = {
    address      : '127.0.0.1',
    port        : '',
    username    : 'riot',
    password    : '',
    protocol    : '',
    hashSum     : ''
}

LoadLockFile(pathlockfile);

//Allow all certificates 
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

//Create listem server 
http.createServer(function(req,res){
    tunnel(req.url, req.method, res)
}).listen(options.port, options.ip);

function LoadLockFile(path){
    setInterval(()=>{
        if(fs.existsSync(path)){
            let sum = getSumSync(path);
            if(sum != lf.hashSum){
                lf.hashSum = sum;
                fs.readFile(path, 'utf-8', (err, data) => {
                    if(err){
                        console.error(err);
                        return;
                    }

                    let splited = data.split(":");

                    lf.port = splited[2];
                    lf.password = splited[3];
                    lf.protocol = splited [4]
                });
            }
        }
    },options.interval);
}

function getSumSync(path){
    if(fs.existsSync(path)){
        const fileBuffer = fs.readFileSync(path);
        const hashSum = crypto.createHash('sha256');
        hashSum.update(fileBuffer);

        const hex = hashSum.digest('hex');
        return hex;
    }
}

function tunnel(url, method, tunnelres){
    let tunnelOptions = {
        hostname: lf.address,
        port: Number(lf.port),
        path: url,
        method: method,
        headers: {
            Authorization: `Basic ${Buffer.from(util.format('%s:%s', lf.username, lf.password)).toString('base64')}`
        },
        protocol: `${lf.protocol}:`
    }
    console.log(`Redirected from \x1b[32m${options.ip}:8080\x1b[0m TO \x1b[32m${lf.address}:${lf.port}\x1b[0m with ${method} method.`);
    let req = https.request(tunnelOptions, res => {
        res.on('data', d => {
            tunnelres.writeHead(res.statusCode, {'Content-Type': 'text/json'});
            tunnelres.end(d.toString());
        });
    });
    req.on('error', e => {
        console.log(e);
    });
    req.end();
}