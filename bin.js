#! /usr/bin/env node
const { program } = require('commander');
const path = require('path');
const fs = require('fs');
const version = require('./package.json').version;
const constants = require('./src/constants');
const logger = require('./src/logger');
const app = require('./index');

program
    .usage("swagger-version-tag [OPTIONS]")
    .version(version)
    .option('-f, --file <file>', 'config file name. default is ' + constants.defaultFileName, constants.defaultFileName)
    .option('-s, --service-name <service>', 'run command for specific service', constants.allServices)
    .option('-c, --command <command>', 'command to run. default is ' + constants.defaultCommand, constants.defaultCommand)
    .option('-o, --out <out>', 'output file. default is ' + constants.outputFileName, constants.outputFileName)
    .parse(process.argv);

function readConfigFile(fileName) {
    const absPath = path.resolve(process.cwd(), fileName)
    if (!fs.existsSync(absPath)) {
        logger.fatal("file does not exist on disk. please make sure about that")
        logger.error("path: " + absPath)
        process.exit(1)
    }
    try {
        let raw = fs.readFileSync(absPath)
        let config = JSON.parse(raw)
        return config
    } catch (error) {
        logger.error(error.toString())
        process.exit(1)
    }
}


function createOptions() {
    return {
        command: program.command,
        serviceName: program.serviceName,
        out: program.out,
        dir: process.cwd(),
        appDir: path.dirname(process.argv[1])
    }
};

function printTagsOut(tags) {
    logger.info("************Services status************\n")
    function printTag(name, data) {
        logger.success("-- " + name + ":")
        logger.info("-- message -- " + data.message)
        logger.info("-- hash    -- " + data.hash)
        logger.info("-- date    -- " + data.date)
        logger.warning("- - - - - - - - - - - - - - - - -\n")
    }

    for (const key of Object.keys(tags)) {
        printTag(key, tags[key])
    }

    logger.info("\n***********END*************")
}

(async function init() {
    const config = readConfigFile(program.file)
    const options = createOptions()
    let tags
    try {
        tags = await app(config, options)
        if (options.command == "tag") {
            printTagsOut(tags)
            logger.success("tags generation completed")
        }
        else {
            logger.success("operatiorn completed successfuly")
        }

    } catch (error) {
        logger.fatal(error.toString())
        process.exit(1);
    }
})()