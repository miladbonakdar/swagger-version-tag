
const inputValidator = require("./inputValidator.js")
const constants = require("./constants")
const optionsValidator = require("./optionsValidator.js")
const logger = require("./logger.js")
const axios = require("axios")
const crypto = require('crypto')
const fs = require('fs');
const path = require('path');
const sh = require("shelljs")

const shaSecret = "hame chi ba ma"

let preData = null
let _config
let _options

module.exports = async function (input, options) {
    inputValidator(input)
    optionsValidator(options)
    _config = input
    _options = options
    preData = null
    const results = [];
    const services = getWorkingServices();
    for (const ep of services) {
        const res = await tag(ep)
        res.name = ep.name
        results.push(res)
    }
    return manageResults(results)
}

function getWorkingServices() {
    serviceName = _options.serviceName
    if (serviceName == constants.allServices)
        return _config.endPoints
    else {
        const service = _config.endPoints.filter(e => e.name == serviceName)[0]
        if (!service) throw new Error('cannot find the service ' + serviceName)
        return [service]
    }
}

async function tag(endPoint) {
    const hashResult = await getAndTag(endPoint.url)
    if (!hashResult.ok) return hashResult
    switch (_options.command) {
        case "gen": {
            const res = generateSwaggerClient(endPoint)
            if (res.ok)
                res.hash = hashResult.hash
            return res
        }
        case "tag":
            return manageResultForTagCommand(hashResult, endPoint.name)
    }
}

function generateSwaggerClient(endPoint) {
    checkForJavaInstalled()
    const dest = path.resolve(_options.dir, endPoint.name)
    const jarFile = path.resolve(_options.appDir, "swagger-codegen-2.4.0-httpclient.jar")

    const command = `java -jar ${jarFile} generate -l ${endPoint.language} -i ${endPoint.url} -o ${dest} -DpackageName=${endPoint.packageName}`
    const code = sh.exec(command).code
    if (code != 0) {
        const message = "error in generating the client from endpoint url"
        logger.fatal(message)
        return {
            ok: false,
            message: message,
            date: new Date().getTime()
        }
    }

    endPoint.moves.forEach(m => {
        move(endPoint.name, m)
    })

    if (endPoint.deleteTempFolder)
        sh.rm('-rf', path.resolve(_options.dir, endPoint.name));

    return {
        ok: true,
        message: "generate and all the moves completed for endpoint " + endPoint.name,
        date: new Date().getTime()
    }
}

function checkForJavaInstalled() {
    var code = sh.exec('java -version', {}).code;
    if (code != 0) {
        logger.fatal("java is not installed on this machine. please make sure about that")
        process.exit(code)
    }
}
function move(endPointname, move) {
    const from = path.resolve(_options.dir, endPointname, move.from)
    const to = path.resolve(_options.dir, move.to)
    sh.mkdir('-p', to)
    const code = sh.mv(from, to).code
    if (code != 0) {
        logger.fatal("problem in moving data from " + from + " to " + to)
    }
}

function manageResultForTagCommand(hashResult, serviceName) {
    const notChanged = hashResult.hash == getPreGeneratedHash(serviceName)
    const message = notChanged ?
        "everything is uptodate with endpoint " + serviceName :
        "new hash captured for endpoint " + serviceName + ". please update"

    if (notChanged)
        logger.success(message)
    else
        logger.warning(message)
    return {
        ok: !notChanged,
        message: message,
        hash: hashResult.hash,
        date: new Date().getTime()
    }
}

async function getAndTag(url) {
    logger.info("trying to get data from " + url)
    const res = await axios.get(url)
    if (res.status != '200') {
        logger.warning("unable to fetch data from " + url)
        return {
            ok: false,
            message: "cannot get data from " + url,
            date: new Date().getTime()
        }
    }

    const hash = generateTagFromData(res.data)

    logger.info("hash generatiet for url " + url)
    return {
        ok: true,
        hash: hash,
        date: new Date().getTime()
    }
}

function generateTagFromData(data) {
    const stringData = JSON.stringify(data.paths) + JSON.stringify(data.definitions)
    hasher = crypto.createHmac('sha256', shaSecret)
    hasher.update(stringData)
    const hash = hasher.digest('hex')
    return hash
}

function getPreGeneratedHash(name) {
    const data = getPreHashData()
    if (data && data[name])
        return data[name].hash
    return ""
}

function getPreHashData() {
    if (preData) return preData
    const filePath = path.resolve(_options.dir, constants.outputFileName)
    if (!fs.existsSync(filePath))
        return null
    let rawData = fs.readFileSync(filePath)
    preData = JSON.parse(rawData)
    logger.info("pre hash data fetched")
    return preData
}

function manageResults(results) {
    switch (_options.command) {
        case "gen": {
            const data = getPreHashData()
            const std = convertToStandardOutput(results)
            if (!data) {
                saveDataToOutput(std)
            }
            else {
                pruneOldServicesFromOutput(_config.endPoints, data)
                saveDataToOutput(mergeOldAndNewOutput(data, std))
            }
            return std
        }
        case "tag":
            return convertToStandardOutput(results, false)
    }
}

function mergeOldAndNewOutput(old, newResult) {
    for (const key of Object.keys(newResult)) {
        old[key] = newResult[key]
    }
    return old
}

function pruneOldServicesFromOutput(endPoints, oldData) {
    if (_options.serviceName != constants.allServices) return oldData
    const keys = Object.keys(oldData)
    for (const key of keys) {
        if (!endPoints.filter(s => s.name == key)[0])
            delete oldData[key]
    }
    return oldData
}

function convertToStandardOutput(results, ignoreBadResults = true) {
    var std = {}
    results.forEach(r => {
        if (ignoreBadResults && !r.ok) return
        std[r.name] = {
            date: r.date,
            hash: r.hash
        }
        if (r.message) {
            std[r.name].message = r.message
        }
    })
    return std
}

function saveDataToOutput(data) {
    const stringData = JSON.stringify(data)
    const filePath = path.resolve(_options.dir, _options.out)
    fs.writeFileSync(filePath, stringData)
}