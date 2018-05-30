
import sbolmeta = require('sbolmeta');
import ViewTopLevelWithObject from 'synbiohub/views/ViewTopLevelWithObject';
import DefaultSBOLFetcher from "../fetch/DefaultSBOLFetcher";
import {getAttachmentsFromTopLevel, getAttachmentsFromList} from 'synbiohub/attachments';
import loadTemplate from '../loadTemplate';
import getUrisFromReq from 'synbiohub/getUrisFromReq';

import { Request, Response } from 'express'
var sparql = require('../sparql/sparql')

export default class ViewTest extends ViewTopLevelWithObject{

    constructor(){
        super()
    }

    meta:any

    agent:string
    plan:string
    dataurl:string



    async prepare(req:Request) {

        await super.prepare(req)

        this.rdfType = {
            name: 'Collection'
        }

        this.setTopLevelMetadata(req, sbolmeta.summarizeGenericTopLevel(this.object))

        let activity_sbol = await DefaultSBOLFetcher.get(req).fetchSBOLObjectRecursive(this.meta.wasGeneratedBy.uri)

        let plan_uri = activity_sbol.object.associations[0].plan.uri.toString()
        
        let plan_sbol = await DefaultSBOLFetcher.get(req).fetchSBOLObjectRecursive(plan_uri)
        
        this.meta.description = this.meta.description.split('<br/>').join('')
        this.agent = activity_sbol.object.associations[0].agent.name
        this.plan = activity_sbol.object.associations[0].plan.name

        this.meta.planattachments = getAttachmentsFromTopLevel(plan_sbol, plan_sbol.object, req.url.toString().endsWith('/share'))


        const { graphUri, uri, designId, baseUri, url } = getUrisFromReq(req)

        var templateParams = {
            uri: uri
        }

        var getAttachmentsQuery = loadTemplate('sparql/GetAttachments.sparql', templateParams)

		let metadataAttachmentList = await sparql.queryJson(getAttachmentsQuery, graphUri)

        this.meta.metadataattachments = await getAttachmentsFromList(graphUri, metadataAttachmentList,
            req.url.toString().endsWith('/share'))


            for (let attachment of this.meta.metadataattachments){
				if (attachment.size === 0){
					this.meta.dataurl = attachment.url
				}

		}

        console.log(this.meta.metadataattachments)

    }



    async render(res:Response) {

        res.render('templates/views/test.jade', this)

    }
}