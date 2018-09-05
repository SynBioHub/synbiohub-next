
import ViewDescribingTopLevel from './ViewDescribingTopLevel';

import { Request, Response } from 'express'
import { SBHRequest } from 'synbiohub/SBHRequest';

export default class ViewModel extends ViewDescribingTopLevel {

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


