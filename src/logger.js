const log = console.log
const chalk = require("chalk")

module.exports.warning = function(message){
    log(chalk.yellowBright.bold(message))
}

module.exports.info = function(message){
    log(chalk.cyan(message))
}

module.exports.error = function(message){
    log(chalk.redBright.bold(message))
}

module.exports.fatal = function(message){
    log(chalk.bgRed.white.bold(message))
}

module.exports.success = function(message){
    log(chalk.greenBright(message))
}
