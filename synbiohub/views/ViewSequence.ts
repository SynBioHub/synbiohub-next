
import ViewDescribingTopLevel from './ViewDescribingTopLevel';
import formatSequence = require('sequence-formatter')

import { Request, Response } from 'express'
import { SBHRequest } from 'synbiohub/SBHRequest';
import { S2Sequence } from 'sbolgraph';
import { Specifiers } from 'bioterms';

export default class ViewSequence extends ViewDescribingTopLevel {

    constructor() {
        super()
    }

    meta:any

    sequence:S2Sequence
    blastUrl:string
    lengthUnits:string
    formatted:string

    async prepare(req:SBHRequest) {

        await super.prepare(req)


        this.sequence = this.object as S2Sequence

        this.rdfType = {
            name: 'Sequence'
        }

        this.blastUrl = this.sequence.encoding === Specifiers.SBOL2.SequenceEncoding.AminoAcid ?
            'http://blast.ncbi.nlm.nih.gov/Blast.cgi?PROGRAM=blastp&PAGE_TYPE=BlastSearch&LINK_LOC=blasthome' :
            'http://blast.ncbi.nlm.nih.gov/Blast.cgi?PROGRAM=blastn&PAGE_TYPE=BlastSearch&LINK_LOC=blasthome'

        this.lengthUnits = this.sequence.encoding === Specifiers.SBOL2.SequenceEncoding.AminoAcid ? 'aa' : 'bp'

        this.formatted = formatSequence(this.sequence.elements)
    }

    async render(res:Response) {

        res.render('templates/views/sequence.jade', this)

    }
}


