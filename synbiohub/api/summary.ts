
import pug = require('pug');
import config from 'synbiohub/config';

import SBHURI from 'synbiohub/SBHURI';

export default async function(req, res) {

    let uri = SBHURI.fromURIOrURL(req.url)

    let result = await DefaultSBOLFetcher.get(req).fetchSBOLObjectRecursive(uri)

    const sbol = result.sbol
    const componentDefinition = result.object

    res.status(200)
        .type('application/json')
        .send(sbol.serializeXML())
};

