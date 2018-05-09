
import async = require('async');
import * as sparqlz from 'synbiohub/sparql/sparql';

async function sparql(graphUris, query, callback) {

    let results = await Promise.all(graphUris.map(
                (graphUri) => sparqlz.queryJson(query, graphUri)))

    return collateResults(results)

    function collateResults(results) {

        var collatedResults = []

        results.forEach((resultSet) => {

            [].push.apply(collatedResults, resultSet)

        })

        return Promise.resolve(collatedResults)

    }

}

export default sparql;



