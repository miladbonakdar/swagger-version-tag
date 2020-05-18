const constants = require('./constants')

module.exports = function name(options) {
    if (!options.command)
        throw new Error("command is not defined")
    if (!constants.commands.filter(c => c == options.command)[0])
        throw new Error("command is not valid")
    if (!options.serviceName)
        throw new Error("service is not defined. for running on all services please enter _all_ for services")
    if (!options.out)
        throw new Error("output file is not defined")
}