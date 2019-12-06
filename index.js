#!/usr/bin/env node
const args = require('minimist')(process.argv.slice(2))

const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');

const helpers = require('./helpers');

const clearBucket = (s3Connection, bucket, contents) => {
    const params = { Bucket: bucket, Key: '' };
    if (contents.Contents.length > 0) {
        for (const file in contents.Contents) {
            params.Key = contents.Contents[file].Key;
            s3Connection.deleteObject(params, (err, data) => {
                if (err) console.log(err, err.stack);
            });
        }
    }
}

const getBucketContents = async (s3Connection, bucket) => {
    const params = { Bucket: bucket };
    return await s3Connection.listObjectsV2(params).promise();
}

const uploadFiles = async (s3Connection, bucket, files) => {
    for (const file of files) {
        try {
            console.log('Trying to upload to s3:', file.filePath)
            await s3Connection.upload({
                Bucket: bucket,
                Key: `${file.filePath}`,
                Body: file.fileContent,
                ACL: 'public-read',
            }).promise();
        } catch (ex) {
            console.log('There was an error uploading at least one of the files', ex);
            process.exit(1);
        }
    }
    console.log('Finished uploading!');
}

const wipeBucketAndUpload = async (s3Connection, src, bucket) => {

    const files = await helpers.getFiles(src);

    if (files.length === 0) {
        console.error('aborting due to provided folder is either empty or does not exist');
        process.exit(1);
    }

    const contents = await getBucketContents(s3Connection, bucket);
    clearBucket(s3Connection, bucket, contents);
    uploadFiles(s3Connection, bucket, files);
}

const init = () => {

    let s3Connection = undefined;
    let bucket = '';

    if (helpers.checkArgs()) {
        s3Connection = helpers.getS3(
            args.key,
            args.secret,
            undefined,
            false
        );
        bucket = args.bucket;
    } else if (!helpers.checkConfigFile() || !helpers.checkSrcArg()) {
        process.exit(1);
    } else {
        const config = helpers.loadConfig();
        if (config !== {}) {
            s3Connection = helpers.getS3(
                config.key,
                config.secret,
                config.endpoint ? config.endpoint : undefined,
                config.pathStyle ? true : false
            );
            bucket = config.bucket;
        } else {
            process.exit(1);
        }
    }

    wipeBucketAndUpload(s3Connection, args.src, bucket);
}

init();
