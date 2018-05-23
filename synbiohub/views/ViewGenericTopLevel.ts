
import sbolmeta = require('sbolmeta');
import ViewTopLevelWithObject from 'synbiohub/views/ViewTopLevelWithObject';

import { Request, Response } from 'express'
import { SBHRequest } from 'synbiohub/SBHRequest';

export default class ViewGenericTopLevel extends ViewTopLevelWithObject {

    constructor() {
        super()
    }

    meta:any

    async prepare(req:SBHRequest) {

        await super.prepare(req)

        this.setTopLevelMetadata(req, sbolmeta.summarizeGenericTopLevel(this.object))
    }

    async render(res:Response) {

        res.render('templates/views/genericTopLevel.jade', this)

    }
}


