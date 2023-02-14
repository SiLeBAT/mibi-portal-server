#!/bin/bash

LOG_FILE=$1
if [ "$#" -ne 1 ]; then
  LOG_FILE=./logs/mibi-portal.log
fi

export MIBI_LOG=$LOG_FILE

npx pm2 kill --no-daemon

echo 'pm2 killed the parse server'
