const tagger = require('./src/versionTag')

module.exports = async function (config, options) {
    return await tagger(config, options)
}