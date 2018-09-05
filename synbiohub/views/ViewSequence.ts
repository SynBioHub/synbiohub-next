
import ViewDescribingTopLevel from './ViewDescribingTopLevel';
import formatSequence = require('sequence-formatter')

import { Request, Response } from 'express'
import { SBHRequest } from 'synbiohub/SBHRequest';
import { S2Sequence } from 'sbolgraph';

export default class ViewSequence extends ViewDescribingTopLevel {

    constructor() {
        super()
    }

    meta:any

    blastUrl:string
    formatted:string

    async prepare(req:SBHRequest) {

        await super.prepare(req)


        let sequence = this.object as S2Sequence

        this.rdfType = {
            name: 'Sequence'
        }

        this.blastUrl = this.meta.type === 'AminoAcid' ?
            'http://blast.ncbi.nlm.nih.gov/Blast.cgi?PROGRAM=blastp&PAGE_TYPE=BlastSearch&LINK_LOC=blasthome' :
            'http://blast.ncbi.nlm.nih.gov/Blast.cgi?PROGRAM=blastn&PAGE_TYPE=BlastSearch&LINK_LOC=blasthome'

        this.meta.formatted = formatSequence(sequence.elements)
    }

    async render(res:Response) {

        res.render('templates/views/sequence.jade', this)

    }
}


