var pug = require('pug')

import config from 'synbiohub/config'

import DefaultSBOLFetcher from '../fetch/DefaultSBOLFetcher';
import { S2ComponentDefinition, S2Sequence } from 'sbolgraph';
import { Specifiers } from 'bioterms';
import SBHURI from 'synbiohub/SBHURI';

export default async function(req, res) {

    const uri = SBHURI.fromURIOrURL(req.url)

    let result = await DefaultSBOLFetcher.get(req).fetchSBOLObjectRecursive(uri)

    const sbol = result.sbol
    const componentDefinition = result.object as S2ComponentDefinition

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


