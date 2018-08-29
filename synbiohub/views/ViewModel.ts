
import ViewTopLevelWithObject from 'synbiohub/views/ViewTopLevelWithObject';

import { Request, Response } from 'express'
import { SBHRequest } from 'synbiohub/SBHRequest';

export default class ViewModel extends ViewTopLevelWithObject {

    constructor() {
        super()
    }

    meta:any

    async prepare(req:SBHRequest) {

        await super.prepare(req)
    }

    async render(res:Response) {

        res.render('templates/views/model.jade', this)

    }
}


