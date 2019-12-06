const AWS = require('aws-sdk');
const args = require('minimist')(process.argv.slice(2))
const fs = require('fs');
const path = require('path');
const readlines = require('n-readlines');

const getS3 = (key, secret, endpoint, s3ForcePathStyle) => {

    const cfg = {
        signatureVersion: 'v4',
        accessKeyId: key,
        secretAccessKey:  secret,
    }

    if (endpoint) cfg.endpoint = endpoint;
    if (s3ForcePathStyle) cfg.s3ForcePathStyle = true;

    return new AWS.S3(cfg);
}

const getFiles = src => {

    const files = [];

    try {
        const filesFromDir = fs.readdirSync(src);

        for (const file of filesFromDir) {
            const filePath = path.join(src, file);

            if (!fs.lstatSync(filePath).isDirectory()) {
                const fileContent = fs.readFileSync(filePath);
                files.push({ filePath, fileContent });
            }
        }
    } catch (ex) {
        console.error('Invalid files error', ex);
        return [];
    }

    return files;
}

const checkSrcArg = () => {
    if (!args.src) {
        console.log('The --src arg is missing!')
        return false;
    } else if (!checkForExistance(args.src)) {
        console.log('The provided folder in --src arg is not existing.')
        return false;
    }

    return true;
}

const checkArgs = () => {
    if (!args.key || !args.secret || !args.src || !args.bucket) {
        console.log('One or all args are missing: --key --secret --src --bucket.');
        return false;
    }
    return true;
}

const checkConfigFile = () =>{
    console.log('Trying to get config file instead...')
    const exists = checkForExistance('.s3-frontend-pusher');
    if (exists) {
        console.log('Config file ".s3-frontend-pusher" file found!')
    } else {
        console.log('Config file ".s3-frontend-pusher" file is missing!')
    }
    return exists;
}

const checkForExistance = (fileOrFolder) => {
     try {
        if (fs.existsSync(fileOrFolder)) {
            return true;
        } else {
            return false;
        }
    } catch (err) {
        console.error(err)
        return false;
    }
}

const loadConfig = () => {
    try {
        const config = {};
        const liner = new readlines('.s3-frontend-pusher');
        const result = [];

        let next;
        while (next = liner.next()) {
            result.push(next.toString('utf-8'));
        }

        if (result[0] && result[1] && result[2]) {
            config.key = result[0];
            config.secret = result[1];
            config.bucket = result[2];

            if (result[3]) {
                config.endpoint = result[3];
            }

            if (result[4]) {
                config.pathStyle = (result[4] == 'true');
            }
        } else {
            console.error('One or all config parameters are missing!')
        }

        return config;
    } catch (err) {
        console.error(err);
        return {}
    }
}

exports.getS3 = getS3;
exports.getFiles = getFiles;
exports.checkSrcArg = checkSrcArg;
exports.checkArgs = checkArgs;
exports.checkConfigFile = checkConfigFile;
exports.loadConfig = loadConfig;
