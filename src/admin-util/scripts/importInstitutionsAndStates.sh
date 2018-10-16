#!/bin/bash

CONFIG_DIR=../../../config 

NODE_CONFIG_DIR=$CONFIG_DIR node importCollection.js ../../../data/bundeslaender.txt
NODE_CONFIG_DIR=$CONFIG_DIR  node importCollection.js ../../../data/einrichtungen.txt
