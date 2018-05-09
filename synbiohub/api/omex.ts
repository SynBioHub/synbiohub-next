const pug = require('pug')
const { fetchSBOLSource } = require('../fetch/fetch-sbol-source')
import serializeSBOL from 'synbiohub/serializeSBOL'
import buildCombineArchive from 'synbiohub/buildCombineArchive'
import config from 'synbiohub/config'
import getUrisFromReq from 'synbiohub/getUrisFromReq'
const fs = require('mz/fs')

module.exports = function (req, res) {

    req.setTimeout(0) // no timeout

    const { graphUri, uri, designId, share } = getUrisFromReq(req, res)

    var archiveName

    let fileName = await fetchSBOLSource(uri, graphUri)

    console.log("sbol file for archive:" + fileName)


    let result = await buildCombineArchive(sbolFilename, []);

    archiveName = result.resultFilename;
    var stat = fs.statSync(archiveName);
    console.log("creating archive:" + archiveName)

    res.writeHead(200, { 'Content-Type': 'application/zip', 'Content-Length': stat.size })

    var readStream = fs.createReadStream(archiveName)

    readStream.pipe(res)
        .on('finish', () => {
            console.log('finish download of combine archive')
        })

    console.log("unlinking:" + fileName)
    await fs.unlink(fileName)
    console.log("unlinking:" + archiveName)
    await fs.unlink(archiveName)
};


