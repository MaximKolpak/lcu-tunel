const http = require('http');
const fs = require('fs');
const crypto = require('crypto');
const options = require('./options');


const pathlockfile = '/Applications/League of Legends.app/Contents/LoL/lockfile';

const lf = {
    adress      :'127.0.0.1',
    port        : '',
    username    : 'riot',
    password    : '',
    protocol    : '',
    hashSum     : ''
}

LoadLockFile(pathlockfile);

//Create listem server 
http.createServer(function(req,res){
    console.log(lf);
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

function tunnel(){

}