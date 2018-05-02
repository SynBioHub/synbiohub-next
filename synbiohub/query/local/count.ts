
import loadTemplate from 'synbiohub/loadTemplate';
import * as sparql from 'synbiohub/sparql/sparql';

export default async function getCount(type, graphUri) {

    var query = loadTemplate('./sparql/Count.sparql', {
        type: type
    })

    let result = await sparql.queryJson(query, graphUri)

    if (result && result[0]) {

        return parseInt(result[0].count)

    } else {

        throw new Error('not found')

    }
}
