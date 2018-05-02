
import * as sparql from 'synbiohub/sparql/sparql';
import loadTemplate from 'synbiohub/loadTemplate';

async function getOwnedBy(topLevelUri, graphUri) {

    const query = loadTemplate('./sparql/GetOwnedBy.sparql', {
        topLevel: topLevelUri
    })

    let results = await sparql.queryJson(query, graphUri)

    return results.map((result) => result.ownedBy)

}

export default getOwnedBy;

