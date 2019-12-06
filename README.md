## s3-frontend-pusher

## This npm package wipes a specified bucket and pushes contents from a directory provided by a user to aws s3. It is intended to be used with small frontends (read the caveats please) and was motiviated by the fact that we had to install *nodejs npm python and awscli* in every pipeline thus making required docker build images larger than alpines and taking longer to build in total.

### How to use:

1. install the package
```
npm i -g s3-frontend-pusher
```

2. use the package in one line
```
s3-frontend-pusher --key=KEY --secret=SECRET --src=folder --bucket=BUCKET
```

or create a config file like so:
```
touch .s3-frontend-pusher
```

This file needs to be in the folder where you make use of the command.
It should be structured in this exact manner:

```
KEY
SECRET
BUCKET
ENDPOINT
S3FORCEPATHSTYLE
```

So line 1 *has to be present* and it has to be the ACCESS_KEY_ID
Line 2 *has to be present* and it has to be the SECRET_KEY
Line 3 *has to be present* and it has to be the bucket name
Line 4 is optional. This is required if you want to do offline uploading against something like localstack or serverless-offline.
Line 5 is optional. Gets activated only if you put in "true" (without the quotes). This property is required if you want to force the path style. So bucketname.hostname.domain becomes hostname.domain/bucketname. We need to activate this to use localstack. Configurating a different endpoint than the aws requires you to create a config file by the way.

If you have created a .s3-frontend-pusher file you can run the command omitting most parameters:

```
s3-frontend-pusher --src=folder
``


## CAVEATS

Only works if the bucket content has less than 1000 files. This is due to AWS setting the list-limit to 1000. So there is room for improvement to implement a
recursive way to check whether there are still files left inside the bucket or not!

## TODOS

* I hate the way we pass the commandline args at the moment and I need to find a shorter way.
* Momentarily uploads happen with ACL: public-read hardcoded. I would like to add plain `public` to the cli to make this configurable.
