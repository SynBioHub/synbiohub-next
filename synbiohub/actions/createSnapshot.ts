
import getUrisFromReq from 'synbiohub/getUrisFromReq';
import splitUri from 'synbiohub/splitUri';
import prepareSnapshot from 'synbiohub/conversion/prepare-snapshot';
import fs = require('mz/fs');
import * as sparql from 'synbiohub/sparql/sparql';
import DefaultSBOLFetcher from 'synbiohub/fetch/DefaultSBOLFetcher';

export default async function(req, res) {

    const { uri, graphUri, baseUri } = getUrisFromReq(req)
    const { displayId } = splitUri(uri)

    let tempFilename = await DefaultSBOLFetcher.get(req).fetchSBOLSource(uri)

    let result = await prepareSnapshot(tempFilename, {
        version: new Date().getTime() + '_snapshot',
        uriPrefix: baseUri
    })

    const { resultFilename } = result

    await sparql.uploadFile(null, resultFilename, 'application/rdf+xml')

    res.redirect('/admin/remotes')
};



