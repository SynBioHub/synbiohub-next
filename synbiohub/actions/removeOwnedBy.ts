
import retrieveUris from 'synbiohub/retrieveUris';
import config from 'synbiohub/config';
import * as sparql from 'synbiohub/sparql/sparql';
import getUrisFromReq from 'synbiohub/getUrisFromReq';
import loadTemplate from 'synbiohub/loadTemplate';
import DefaultMDFetcher from 'synbiohub/fetch/DefaultMDFetcher';

export default async function (req, res) {

    const { graphUri, uri, designId, share } = getUrisFromReq(req);

    let ownedBy = await DefaultMDFetcher.get(req).getOwnedBy(uri)

    if (ownedBy.indexOf(config.get('databasePrefix') + 'user/' + req.user.username) === -1) {
        res.status(401).send('not authorized to remove an owner')
    }

    let uris = await retrieveUris(uri, graphUri)

    let chunks = [];
    let offset = config.get('resolveBatch');

    for (let i = 0; i < uris.length; i += offset) {
        let end = i + offset < uris.length ? i + offset : uris.length;

        chunks.push(uris.slice(i, end));
    }

    const sharedRemovalQuery = loadTemplate('./sparql/RemoveFromSharedCollection.sparql', {
        uri: uri,
        userUri: req.body.userUri
    });

    let result = await sparql.updateQuery(sharedRemovalQuery, req.body.userUri)

    return await Promise.all(chunks.map(async (chunk) => {

        let uris = chunk.map(uri => {
            return '<' + uri + '> sbh:ownedBy <' + req.body.userUri + '>';
        }).join(' . \n');

        const updateQuery = loadTemplate('./sparql/RemoveOwnedBy.sparql', {
            uris: uris
        });

        await sparql.updateQuery(updateQuery, graphUri)

        res.redirect(share);
    }))

}


