#!/bin/bash

# To be used with master-data v1.0.0
# Make sure the $CONFIG_DIR points towards the directory containing the environment specific config file
# Make sure the $DATA_DIR points towards the directory containing the appropriate data (see master-data version above)

CONFIG_DIR=/Users/toelle/dev/tmp/migration/config
DATA_DIR=/Users/toelle/dev/tmp/migration/data
SCRIPT_DIR=../../scripts

# Importing new Master Data
NODE_CONFIG_DIR=$CONFIG_DIR node $SCRIPT_DIR/importCollection.js $DATA_DIR/nrls/nrls.json
NODE_CONFIG_DIR=$CONFIG_DIR node $SCRIPT_DIR/importCollection.js $DATA_DIR/validation-errors/validationerrors.json

# Updating old State collection
NODE_CONFIG_DIR=$CONFIG_DIR node ./writeAVVEntries.js $DATA_DIR/states/states.json