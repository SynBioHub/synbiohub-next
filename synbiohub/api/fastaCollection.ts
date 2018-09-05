
var pug = require('pug')

import config from 'synbiohub/config'

import DefaultSBOLFetcher from 'synbiohub/fetch/DefaultSBOLFetcher';
import SBHURI from 'synbiohub/SBHURI';

export default async function(req, res) {

    let uri = SBHURI.fromURIOrURL(req.url)

    throw new Error('todo')

    /*
    let fasta = await DefaultSBOLFetcher.get(req).fetchCollectionFASTA(uri)

    res.send(fasta)*/

};



