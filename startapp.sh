#!/bin/bash

source ./environment.sh

LOG_FILE=$1
if [ "$#" -ne 1 ]; then
  LOG_FILE=./mibi_output
fi

BASE_NAME=`basename $LOG_FILE .log`
DIR_NAME=`dirname $LOG_FILE`
ADMIN_LOG=$DIR_NAME/$BASE_NAME-admin.log

NODE_ENV=$MIBI_NODE_ENV HOST=$MIBI_HOST MIBI_API_ROOT=$MIBI_API_ROOT forever -l $LOG_FILE -a start ./lib/main.js
forever -l $ADMIN_LOG -a start ./node_modules/mongo-express/app.js
