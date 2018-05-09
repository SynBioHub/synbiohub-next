import pug = require('pug');
import sbolmeta = require('sbolmeta');
import config from 'synbiohub/config';
import getUrisFromReq from 'synbiohub/getUrisFromReq';
import DefaultSBOLFetcher from 'synbiohub/fetch/DefaultSBOLFetcher';

export default async function(req, res) {

    const { graphUri, uri, designId, share } = getUrisFromReq(req)

    let result = await DefaultSBOLFetcher.get(req).fetchSBOLObjectRecursive(uri)

    const sbol = result.sbol
    const sequence = result.object

    var meta = sbolmeta.summarizeSequence(sequence)

    var lines = []
    var charsPerLine = 70

    lines.push('>' + meta.name 
        + ' (' + meta.length + ' ' + meta.lengthUnits + ')')

    for(var i = 0; i < meta.length; ) {

        lines.push(meta.elements.substr(i, charsPerLine))
        i += charsPerLine
    }

    var fasta = lines.join('\n')

    res.header('content-type', 'text/plain').send(fasta)
};


