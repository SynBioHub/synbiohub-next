var pug = require('pug')

var sbolmeta = require('sbolmeta')

import config from 'synbiohub/config'

import getUrisFromReq from 'synbiohub/getUrisFromReq'
import DefaultSBOLFetcher from '../fetch/DefaultSBOLFetcher';

export default async function(req, res) {

    const { graphUri, uri, designId, share } = getUrisFromReq(req)

    let result = await DefaultSBOLFetcher.get(req).fetchSBOLObjectRecursive(uri)

    const sbol = result.sbol
    const componentDefinition = result.object

    var meta = sbolmeta.summarizeComponentDefinition(componentDefinition)

    var lines = []
    var charsPerLine = 70

    meta.sequences.forEach((sequence, i) => {

        lines.push('>' + meta.name + ' sequence ' + (i + 1)
            + ' (' + sequence.length + ' ' + sequence.lengthUnits + ')')

        for(let i = 0; i < sequence.length; ) {

            lines.push(sequence.elements.substr(i, charsPerLine))
            i += charsPerLine
        }

    })

    var fasta = lines.join('\n')

    res.header('content-type', 'text/plain').send(fasta)
};


