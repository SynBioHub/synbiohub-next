
import pug = require('pug');
import * as sparql from 'synbiohub/sparql/sparql';
import config from 'synbiohub/config';

export default async function(req, res) {

    const query = [
        'SELECT DISTINCT ?graph WHERE {',
            'GRAPH ?graph { ?s ?a ?t }',
        '}'
    ].join('\n')

    let results = await sparql.queryJson(query, null)

    let graphs = results.map((result) => graphInfo(result.graph))

    var locals = {
        config: config.get(),
        section: 'admin',
        adminSection: 'sparql',
        user: req.user,
        graphs: graphs
    }

    res.send(pug.renderFile('templates/views/admin/sparql.jade', locals))


    async function graphInfo(graphUri) {

        const countTriplesQuery =  [
            'SELECT (COUNT(*) as ?count) WHERE {',
                '?s ?p ?o .',
            '}'
        ].join('\n')

        let results = await sparql.queryJson(countTriplesQuery, graphUri)

        return {
            graphUri: graphUri,
            numTriples: results[0].count
        }
    }

};
