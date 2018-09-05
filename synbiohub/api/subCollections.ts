

import DefaultMDFetcher from 'synbiohub/fetch/DefaultMDFetcher';
import SBHURI from '../SBHURI';

async function subCollections(req, res) {

    let uri = SBHURI.fromURIOrURL(req.url)

    let collections = await DefaultMDFetcher.get(req).getSubCollections(uri)

    res.header('content-type', 'application/json').send(JSON.stringify(collections))

}

export default subCollections;


