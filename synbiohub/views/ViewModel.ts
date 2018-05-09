
import sbolmeta = require('sbolmeta');
import ViewTopLevelWithObject from 'synbiohub/views/ViewTopLevelWithObject';

import { Request, Response } from 'express'

export default class ViewModel extends ViewTopLevelWithObject {

    constructor() {
        super()
    }

    meta:any

    async prepare(req:Request) {

        await super.prepare(req)

        this.setTopLevelMetadata(req, sbolmeta.summarizeModel(this.object))
    }

    async render(res:Response) {

        res.render('templates/views/model.jade', this)

    }
}


