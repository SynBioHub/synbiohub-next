
import getUrisFromReq from 'synbiohub/getUrisFromReq';
import splitUri from 'synbiohub/splitUri';
import { fetchSBOLSource } from 'synbiohub/fetch/fetch-sbol-source';
import prepareSnapshot from 'synbiohub/conversion/prepare-snapshot';
import fs from 'mz/fs';
import * as sparql from 'synbiohub/sparql/sparql';

export default async function(req, res) {

    const { uri, graphUri, baseUri } = getUrisFromReq(req, res)
    const { displayId } = splitUri(uri)

    let tempFilename = await fetchSBOLSource(uri, graphUri)

    let result = await prepareSnapshot(tempFilename, {
        version: new Date().getTime() + '_snapshot',
        uriPrefix: baseUri
    })

    const { resultFilename } = result

    await sparql.uploadFile(null, resultFilename, 'application/rdf+xml')

    res.redirect('/admin/remotes')
};



