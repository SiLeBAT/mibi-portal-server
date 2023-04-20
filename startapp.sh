#!/bin/bash

source ./environment.sh

LOG_FILE=$1
if [ "$#" -ne 1 ]; then
  LOG_FILE=./logs/mibi-portal.log
fi

export MIBI_LOG=$LOG_FILE

npx pm2 kill --no-daemon
npx pm2 start pm2.config.js

# npx pm2 start pm2.config.js --only mibi-parse-server
# npx pm2 start pm2.config.js --only mibi-parse-dashboard
