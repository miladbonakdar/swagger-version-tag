const constants = require('./constants')

module.exports = function name(input) {
    if (!input.endPoints)
        throw new Error("end point are not defined")

    if (!Array.isArray(input.endPoints))
        throw new Error("end point should be an array")

    input.endPoints.forEach(ep => {

        if (!ep.name)
            throw new Error("end point name is required")

        if (!ep.url)
            throw new Error("end point " + ep.name + " should have url to the swagger json endpoint")

        if (!ep.language)
            throw new Error("end point " + ep.name + " does not have language specified")


        if (!isValidLanguage(ep.language))
            throw new Error("end point " + ep.name + " does not have a valid language")

        if (!ep.packageName)
            throw new Error("end point " + ep.name + " does not have package name specified")

        if (!ep.moves)
            ep.moves = []

        if (!Array.isArray(ep.moves))
            throw new Error("Moves should be an array")

        ep.moves.forEach(mv => {
            if (typeof mv !== 'object' || !mv)
                throw new Error("Move should be an object")

            if (!mv.from)
                throw new Error("missing field 'from' in the move object")

            if (!mv.to)
                throw new Error("missing field 'to' in the move object")

            if (typeof mv.to !== "string" || typeof mv.from !== "string")
                throw new Error("the 'from' and 'to' fields of the move object should be string")
        });
        
        ep.deleteTempFolder = (ep.deleteTempFolder == undefined || ep.deleteTempFolder == null) ? true : ep.deleteTempFolder

        if (typeof ep.deleteTempFolder !== 'boolean')
            throw new Error("'deleteTempFolder' field should be a boolean")
    });
}

function isValidLanguage(lang) {
    return constants.languages.filter(l => l == lang)[0] ? true : false;
}