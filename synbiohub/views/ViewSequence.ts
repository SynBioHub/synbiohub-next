
import sbolmeta from 'sbolmeta';
import ViewTopLevelWithObject from 'synbiohub/views/ViewTopLevelWithObject';
import formatSequence from 'sequence-formatter'

import { Request, Response } from 'express'

export default class ViewSequence extends ViewTopLevelWithObject {

    constructor() {
        super()
    }

    meta:any

    blastUrl:string
    formatted:string

    async prepare(req:Request) {

        await super.prepare(req)

        this.setTopLevelMetadata(req, sbolmeta.summarizeSequence(this.object))

        this.blastUrl = this.meta.type === 'AminoAcid' ?
            'http://blast.ncbi.nlm.nih.gov/Blast.cgi?PROGRAM=blastp&PAGE_TYPE=BlastSearch&LINK_LOC=blasthome' :
            'http://blast.ncbi.nlm.nih.gov/Blast.cgi?PROGRAM=blastn&PAGE_TYPE=BlastSearch&LINK_LOC=blasthome'

        this.formatted = formatSequence(this.meta.elements)
    }

    async render(res:Response) {

        res.render('templates/views/sequence.jade', this)

    }
}


