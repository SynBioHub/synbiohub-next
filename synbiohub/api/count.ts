
var pug = require('pug')

import config from 'synbiohub/config'
import DefaultMDFetcher from 'synbiohub/fetch/DefaultMDFetcher';

export default async function(req, res) {

    let result = await DefaultMDFetcher.get(req).getCount(req.params.type)

    res.header('content-type', 'text/plain').send(result.toString())
}

