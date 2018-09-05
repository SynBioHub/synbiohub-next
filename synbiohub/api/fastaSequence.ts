import pug = require('pug');
import config from 'synbiohub/config';
import DefaultSBOLFetcher from 'synbiohub/fetch/DefaultSBOLFetcher';
import { S2Sequence } from 'sbolgraph';
import { Specifiers } from 'bioterms';
import SBHURI from 'synbiohub/SBHURI';

export default async function(req, res) {

    let uri = SBHURI.fromURIOrURL(req.url)

    let result = await DefaultSBOLFetcher.get(req).fetchSBOLObjectRecursive(uri)

    const sbol = result.sbol
    const sequence = result.object as S2Sequence

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



