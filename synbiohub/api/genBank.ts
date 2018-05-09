var pug = require('pug')

var sbolmeta = require('sbolmeta')

import serializeSBOL from 'synbiohub/serializeSBOL'

var request = require('request');

var SBOLDocument = require('sboljs')

import config from 'synbiohub/config'

import getUrisFromReq from 'synbiohub/getUrisFromReq'

import convertToGenBank from 'synbiohub/conversion/convert-to-genbank'
import DefaultSBOLFetcher from 'synbiohub/fetch/DefaultSBOLFetcher';

const tmp = require('tmp-promise')

var fs = require('mz/fs');

export default async function(req, res) {

    const { graphUri, uri, designId, share } = getUrisFromReq(req)

    var sbol
    var componentDefinition

	async function saveTempFile() {

        let tmpFilename = await tmp.tmpName()

        await fs.writeFile(tmpFilename, serializeSBOL(sbol))

        return tmpFilename
    }

    let result = await DefaultSBOLFetcher.get(req).fetchSBOLObjectRecursive(uri)

    sbol = result.sbol
    componentDefinition = result.object

    console.log('-- converting to genbank');

    let tmpFilename = await saveTempFile()
        
    result = await convertToGenBank(tmpFilename, {

    })

    const { success, log, errorLog, resultFilename } = result

    if (!success) {

        const locals = {
            config: config.get(),
            section: 'invalid',
            user: req.user,
            errors: [errorLog]
        }

        await fs.unlink(tmpFilename)

        res.send(pug.renderFile('templates/views/errors/invalid.jade', locals))
        return

    } else {
        await fs.unlink(tmpFilename)

        res.header('content-type', 'text/plain').send(log);
        //res.header('content-type', 'text/plain').send(log);
    }
}
