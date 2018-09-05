
var async = require('async')

import config from 'synbiohub/config'

var pug = require('pug')

import DefaultMDFetcher from 'synbiohub/fetch/DefaultMDFetcher';
import DefaultSBOLFetcher from 'synbiohub/fetch/DefaultSBOLFetcher';
import SBHURI from 'synbiohub/SBHURI';

var sbol = require('./sbol')

const fs = require('mz/fs')

export default async function(req, res) {

    const uri = SBHURI.fromURIOrURL(req.url)

    let result = await DefaultMDFetcher.get(req).getVersion(uri)
	
    var newUri = uri.toURL() + '/' + result

    let tempFilename = await DefaultSBOLFetcher.get(req).fetchSBOLSource(uri)

    res.status(200).type('application/rdf+xml')
    //.set({ 'Content-Disposition': 'attachment; filename=' + collection.name + '.xml' })

    const readStream = fs.createReadStream(tempFilename)

    readStream.pipe(res).on('finish', () => {
        fs.unlink(tempFilename)
    })
}

