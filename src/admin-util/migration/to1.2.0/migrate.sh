#!/bin/bash

# To be used with master-data v1.2.0
# Make sure the $CONFIG_DIR points towards the directory containing the environment specific config file
# Make sure the $DATA_DIR points towards the directory containing the appropriate data (see master-data version above)

CONFIG_DIR=../../../../config
SCRIPT_DIR=../../scripts

# Importing new Master Data
NODE_CONFIG_DIR=$CONFIG_DIR node $SCRIPT_DIR/importCollection.js ../validation-errors/validationerrors.json
NODE_CONFIG_DIR=$CONFIG_DIR node $SCRIPT_DIR/importCollection.js ../nrls/nrls.json