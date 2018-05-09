const pug = require('pug')

import serializeSBOL from 'synbiohub/serializeSBOL'
import buildCombineArchive from 'synbiohub/buildCombineArchive'
import config from 'synbiohub/config'
import getUrisFromReq from 'synbiohub/getUrisFromReq'
import DefaultSBOLFetcher from 'synbiohub/fetch/DefaultSBOLFetcher';
const fs = require('mz/fs')

export default async function (req, res) {

    req.setTimeout(0) // no timeout

    const { graphUri, uri, designId, share } = getUrisFromReq(req)

    var archiveName

    let fileName = await DefaultSBOLFetcher.get(req).fetchSBOLSource(uri)

    console.log("sbol file for archive:" + fileName)


    let result = await buildCombineArchive(fileName, []);

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


