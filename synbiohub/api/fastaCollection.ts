
var pug = require('pug')

import config from 'synbiohub/config'

import getUrisFromReq from 'synbiohub/getUrisFromReq'
import DefaultSBOLFetcher from 'synbiohub/fetch/DefaultSBOLFetcher';

export default async function(req, res) {

    const { graphUri, uri, designId, share } = getUrisFromReq(req)


    throw new Error('todo')

    /*
    let fasta = await DefaultSBOLFetcher.get(req).fetchCollectionFASTA(uri)

    res.send(fasta)*/

};



