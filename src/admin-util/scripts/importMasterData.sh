#!/bin/bash

CONFIG_DIR=../../../config 

NODE_CONFIG_DIR=$CONFIG_DIR node importCollection.js ../../../data/states.json
NODE_CONFIG_DIR=$CONFIG_DIR  node importCollection.js ../../../data/einrichtungen.txt
