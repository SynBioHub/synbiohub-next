
import sbolmeta = require('sbolmeta');
import ViewTopLevelWithObject from 'synbiohub/views/ViewTopLevelWithObject';
import DefaultSBOLFetcher from "../fetch/DefaultSBOLFetcher";
import {getAttachmentsFromTopLevel} from 'synbiohub/attachments';

import { Request, Response } from 'express'

export default class ViewImplementation extends ViewTopLevelWithObject {

    constructor() {
        super()
    }


    meta:any

    agent:string
    plan:string
    location:string

    async prepare(req:Request) {

        await super.prepare(req)

        this.rdfType = {
            name: 'Implementation'
        }

        this.setTopLevelMetadata(req, sbolmeta.summarizeGenericTopLevel(this.object))
        
        let activity_sbol = await DefaultSBOLFetcher.get(req).fetchSBOLObjectRecursive(this.meta.wasGeneratedBy.uri)
        
        let plan_uri = activity_sbol.object.associations[0].plan.uri.toString()
        
        let plan_sbol = await DefaultSBOLFetcher.get(req).fetchSBOLObjectRecursive(plan_uri)
        
        this.meta.description = this.meta.description.split('<br/>').join('')
        this.location = this.annotations[2]['value']
        this.agent = activity_sbol.object.associations[0].agent.name
        this.plan = activity_sbol.object.associations[0].plan.name

        this.meta.attachments = getAttachmentsFromTopLevel(plan_sbol, plan_sbol.object, req.url.toString().endsWith('/share'))


        

    }


    async render(res:Response) {

        res.render('templates/views/implementation.jade', this)

    }
}