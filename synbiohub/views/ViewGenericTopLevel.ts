
import ViewDescribingTopLevel from './ViewDescribingTopLevel';

import { Request, Response } from 'express'
import { SBHRequest } from 'synbiohub/SBHRequest';

export default class ViewGenericTopLevel extends ViewDescribingTopLevel {

    constructor() {
        super()
    }

    meta:any

    async prepare(req:SBHRequest) {

        await super.prepare(req)
    }

    async render(res:Response) {

        res.render('templates/views/genericTopLevel.jade', this)

    }
}


