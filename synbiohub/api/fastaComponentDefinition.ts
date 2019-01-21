var pug = require('pug')

import config from 'synbiohub/config'


import { SBOL2Graph, S2Identified, S2ComponentDefinition, S2Sequence } from 'sbolgraph';
import { Types } from 'bioterms'
import { Specifiers } from 'bioterms';
import SBHURI from 'synbiohub/SBHURI';
import Datastores from 'synbiohub/datastore/Datastores';

export default async function(req, res) {

    let uri = SBHURI.fromURIOrURL(req.url)

    let datastore = Datastores.forSBHURI(uri)

    let graph:SBOL2Graph = new SBOL2Graph()
    let identified:S2Identified = new S2Identified(graph, uri.toURI())

    await datastore.fetchEverything(graph, identified)

    if(identified.objectType !== Types.SBOL2.ComponentDefinition) {
        throw new Error('expected componentdefinition')
    }

    let componentDefinition = new S2ComponentDefinition(graph, uri.toURI())

    if(componentDefinition.sequences.length !== 1) {
        throw new Error('need exactly one sequence to create fasta')
    }

    let sequence:S2Sequence = componentDefinition.sequences[0]

    await datastore.fetchEverything(graph, sequence)



    // TODO: fasta generation code duplicated in fastaSequence

    var lines = []
    var charsPerLine = 70

    componentDefinition.sequences.forEach((sequence:S2Sequence, i) => {

        lines.push('>' + componentDefinition.name + ' sequence ' + (i + 1)
            + ' (' + sequence.elements.length + ' ' + (sequence.encoding === Specifiers.SBOL2.SequenceEncoding.AminoAcid ? 'aa' : 'bp') + ')')

        for(let i = 0; i < sequence.elements.length; ) {

            lines.push(sequence.elements.substr(i, charsPerLine))
            i += charsPerLine
        }

    })

    var fasta = lines.join('\n')

    res.header('content-type', 'text/plain').send(fasta)
};


