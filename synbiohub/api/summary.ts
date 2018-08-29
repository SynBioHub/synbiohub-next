
import pug = require('pug');
import config from 'synbiohub/config';
import getUrisFromReq from 'synbiohub/getUrisFromReq';
import DefaultSBOLFetcher from 'synbiohub/fetch/DefaultSBOLFetcher';

export default async function(req, res) {

    const { graphUri, uri, designId, share } = getUrisFromReq(req)
    
    let result = await DefaultSBOLFetcher.get(req).fetchSBOLObjectRecursive(uri)

    const sbol = result.sbol
    const componentDefinition = result.object

    res.status(200)
        .type('application/json')
        .send(sbol.serializeXML())
};

