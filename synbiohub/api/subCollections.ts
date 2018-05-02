

import getUrisFromReq from 'synbiohub/getUrisFromReq';
import { getSubCollections } from 'synbiohub/query/collection';

async function subCollections(req, res) {

    const { graphUri, uri, designId, share } = getUrisFromReq(req, res)

    let collections = await getSubCollections(uri, graphUri)

    res.header('content-type', 'application/json').send(JSON.stringify(collections))

}

export default subCollections;


