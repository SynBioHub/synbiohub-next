import pug = require('pug');
import config from 'synbiohub/config';

import { Specifiers } from 'bioterms';
import SBHURI from 'synbiohub/SBHURI';
import Datastores from 'synbiohub/datastore/Datastores';
import { SBOL2Graph, S2Identified, S2Sequence } from 'sbolgraph';
import { Types } from 'bioterms'

export default async function(req, res) {

    let uri = SBHURI.fromURIOrURL(req.url)

    let datastore = Datastores.forSBHURI(uri)

    let graph:SBOL2Graph = new SBOL2Graph()
    let identified:S2Identified = new S2Identified(graph, uri.toURI())

    await datastore.fetchEverything(graph, identified)

    if(identified.objectType !== Types.SBOL2.Sequence) {
        throw new Error('expected sequence')
    }

    let sequence = new S2Sequence(graph, uri.toURI())


    // TODO: fasta generation code duplicated in fastaComponentDefinition

    var lines = []
    var charsPerLine = 70

    let lengthUnits = sequence.encoding === Specifiers.SBOL2.SequenceEncoding.AminoAcid ? 'aa' : 'bp'

    lines.push('>' + sequence.displayName
        + ' (' + sequence.elements.length + ' ' + lengthUnits + ')')

    for(var i = 0; i < sequence.elements.length; ) {

        lines.push(sequence.elements.substr(i, charsPerLine))
        i += charsPerLine
    }

    var fasta = lines.join('\n')

    res.header('content-type', 'text/plain').send(fasta)
};



