#!/bin/bash

LOG_FILE=$1
if [ "$#" -ne 1 ]; then
  LOG_FILE=./mibi_output
fi

BASE_NAME=`basename $LOG_FILE .log`
DIR_NAME=`dirname $LOG_FILE`
ADMIN_LOG=$DIR_NAME/$BASE_NAME-admin.log

forever -l $LOG_FILE -a start lib/main.js
cp ./config/config.js ./node_modules/mongo-express/
ME_CONFIG_MONGODB_URL='mongodb://localhost:27017/epilab' forever -l $ADMIN_LOG -a start ./node_modules/mongo-express/app.js
