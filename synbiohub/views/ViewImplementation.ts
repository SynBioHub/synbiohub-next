
import ViewTopLevelWithObject from 'synbiohub/views/ViewTopLevelWithObject';
import DefaultSBOLFetcher from "../fetch/DefaultSBOLFetcher";
import {getAttachmentsFromTopLevel} from 'synbiohub/attachments';

import { Request, Response } from 'express'
import { SBHRequest } from 'synbiohub/SBHRequest';

import { S2ProvActivity } from 'sbolgraph'
import SBHURI from 'synbiohub/SBHURI';

export default class ViewImplementation extends ViewTopLevelWithObject {

    constructor() {
        super()
    }


    meta:any

    agent:string
    location:string
    organism:string
    taxId:string
    plan:string
    plan_url:string

    async prepare(req:SBHRequest) {

        await super.prepare(req)

        this.rdfType = {
            name: 'Implementation'
        }

        let activity_sbol = await DefaultSBOLFetcher.get(req).fetchSBOLObjectRecursive(this.meta.wasGeneratedBy.uri)
        let activity_sbol_object = activity_sbol.object as S2ProvActivity
        
        let plan_uri = SBHURI.fromURIOrURL(activity_sbol_object.plan.uri)
        
        let plan_sbol = await DefaultSBOLFetcher.get(req).fetchSBOLObjectRecursive(plan_uri)
        
        this.meta.description = this.meta.description.split('<br/>').join('')
        this.location = this.annotations[2]['value']
        this.agent = activity_sbol_object.associations[0].agent.name
        this.plan = activity_sbol_object.associations[0].plan.name
        this.taxId = this.annotations[3]['uri']
        this.organism = this.annotations[4]['value']

        this.meta.attachments = getAttachmentsFromTopLevel(plan_sbol, plan_sbol.object, req.url.toString().endsWith('/share'))
        
        this.plan_url = this.meta.attachments[0]['url'] + '/download'

    }


    async render(res:Response) {

        res.render('templates/views/implementation.jade', this)

    }
}