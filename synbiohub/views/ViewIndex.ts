
import { SBHRequest } from "synbiohub/SBHRequest";
import View from "synbiohub/views/View";
import { Response } from 'express'

export default class ViewIndex extends View {

    constructor() {
        super()
    }

    async prepare(req:SBHRequest) {

        await super.prepare(req)

    }

    async render(res:Response) {

        res.render('templates/views/index.jade', this)

    }
}

