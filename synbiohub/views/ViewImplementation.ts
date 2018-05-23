
import sbolmeta = require('sbolmeta');
import ViewTopLevelWithObject from 'synbiohub/views/ViewTopLevelWithObject';

import { Request, Response } from 'express'

export default class ViewImplementation extends ViewTopLevelWithObject {

    constructor() {
        super()
    }


    meta:any

    async prepare(req:Request) {

        await super.prepare(req)

        this.rdfType = {
            name: 'Implementation'
        }

        this.setTopLevelMetadata(req, sbolmeta.summarizeGenericTopLevel(this.object))

        console.log(this)
        console.log('hithere')


    }


    async render(res:Response) {

        res.render('templates/views/implementation.jade', this)

    }
}