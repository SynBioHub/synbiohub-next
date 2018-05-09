

import getUrisFromReq from 'synbiohub/getUrisFromReq';
import DefaultMDFetcher from 'synbiohub/fetch/DefaultMDFetcher';

async function subCollections(req, res) {

    const { graphUri, uri, designId, share } = getUrisFromReq(req)

    let collections = await DefaultMDFetcher.get(req).getSubCollections(uri)

    res.header('content-type', 'application/json').send(JSON.stringify(collections))

}

export default subCollections;


