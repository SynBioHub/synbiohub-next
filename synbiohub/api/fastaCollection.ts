
var pug = require('pug')

const { fetchCollectionFASTA } = require('../fetch/fetch-collection-fasta')

import config from 'synbiohub/config'

import getUrisFromReq from 'synbiohub/getUrisFromReq'

module.exports = function(req, res) {

    const { graphUri, uri, designId, share } = getUrisFromReq(req, res)

    let fasta = await fetchCollectionFASTA(uri)

    res.send(fasta)

};



