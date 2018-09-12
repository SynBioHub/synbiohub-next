import { SBHRequest } from "../SBHRequest";
import { Response } from 'express'
import View from "synbiohub/views/View";

export default class View404 extends View {

    async prepare(req:SBHRequest) {

        await super.prepare(req)

    }

    async render(res:Response) {

        res.status(404)
        res.render('templates/views/errors/404.jade', this)

    }
}
