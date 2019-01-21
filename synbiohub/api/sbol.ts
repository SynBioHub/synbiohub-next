
import pug = require('pug');
import serializeSBOL from 'synbiohub/serializeSBOL';
import config from 'synbiohub/config';
import * as fs from 'mz/fs';

import SBHURI from 'synbiohub/SBHURI';
import { SBOL2Graph, S2Identified } from 'sbolgraph';
import Datastores from 'synbiohub/datastore/Datastores';

export default async function(req, res) {

    req.setTimeout(0) // no timeout

    let uri = SBHURI.fromURIOrURL(req.url)

    let datastore = Datastores.forSBHURI(uri)

    let graph:SBOL2Graph = new SBOL2Graph()
    let identified:S2Identified = new S2Identified(graph, uri.toURI())

    await datastore.fetchTopLevel(graph, identified)

    res.status(200).type('application/rdf+xml')
        //.set({ 'Content-Disposition': 'attachment; filename=' + collection.name + '.xml' })

    res.send(graph.serializeXML())
};


