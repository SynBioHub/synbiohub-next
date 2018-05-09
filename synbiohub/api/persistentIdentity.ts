
var async = require('async')

import config from 'synbiohub/config'

var pug = require('pug')

import getUrisFromReq from 'synbiohub/getUrisFromReq'
import DefaultMDFetcher from 'synbiohub/fetch/DefaultMDFetcher';
import DefaultSBOLFetcher from 'synbiohub/fetch/DefaultSBOLFetcher';

var sbol = require('./sbol')

const fs = require('mz/fs')

export default async function(req, res) {

    const { graphUri, uri, designId, url } = getUrisFromReq(req)

    let result = await DefaultMDFetcher.get(req).getVersion(uri)
	
    var newUri = uri + '/' + result

    let tempFilename = await DefaultSBOLFetcher.get(req).fetchSBOLSource(newUri)

    res.status(200).type('application/rdf+xml')
    //.set({ 'Content-Disposition': 'attachment; filename=' + collection.name + '.xml' })

    const readStream = fs.createReadStream(tempFilename)

    readStream.pipe(res).on('finish', () => {
        fs.unlink(tempFilename)
    })
}

