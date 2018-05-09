
import { Request, Response } from 'express'
import { getAttachmentsForSubject } from "synbiohub/attachments";
import DefaultMDFetcher from "synbiohub/fetch/DefaultMDFetcher";

import extend = require('xtend')
import ViewTopLevelWithObject from "synbiohub/views/ViewTopLevelWithObject";

import sbolmeta = require('sbolmeta')

export default class ViewCollection extends ViewTopLevelWithObject {

    constructor() {

        super()

    }

    async prepare(req: Request) {

        await super.prepare(req)

        this.rdfType = {
            name: 'Collection',
        }

        let meta:any = sbolmeta.summarizeGenericTopLevel(this.object)

        meta.members = []

        this.setTopLevelMetadata(req, meta)
    }

    async render(res:Response) {

        res.render('templates/views/collection.jade', this)

    }
}
