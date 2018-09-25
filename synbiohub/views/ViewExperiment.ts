
import ViewDescribingTopLevel from './ViewDescribingTopLevel';

import {getAttachmentsFromTopLevel, getAttachmentsFromList} from 'synbiohub/attachments';
import loadTemplate from '../loadTemplate';

import { Request, Response } from 'express'
import { SBHRequest } from 'synbiohub/SBHRequest';
var sparql = require('../sparql/sparql')

import { S2ProvActivity, SEP21Experiment, S2ProvAssociation, S2Implementation } from 'sbolgraph'

export default class ViewTest extends ViewDescribingTopLevel{

    constructor(){
        super()
    }

    meta:any

    experiment:SEP21Experiment

    construct:string
    construct_uri:string
    agent:string
    dataurl:string
    organism:string
    taxId:string
    plan:string
    plan_url:string
    metadata:any[]


    async prepare(req:SBHRequest) {

        await super.prepare(req)

        this.rdfType = {
            name: 'Experiment'
        }

        this.experiment = this.object as SEP21Experiment

        await this.datastore.fetchEverything(this.graph, this.experiment)

        let act = this.experiment.activity as S2ProvActivity

        await this.datastore.fetchEverything(this.graph, act)

        let asc = act.association as S2ProvAssociation
        
        await this.datastore.fetchEverything(this.graph, asc)

        let agent = asc.agent

        await this.datastore.fetchEverything(this.graph, agent)

        let plan = asc.plan
        
        await this.datastore.fetchEverything(this.graph, plan)

        this.agent = agent.displayName

        this.plan = plan.displayName

        this.plan_url = plan.uri

        this.taxId = this.experiment.getUriProperty('http://w3id.org/synbio/ont#taxId')

        this.organism = this.experiment.getUriProperty('http://www.biopax.org/release/biopax-level3.owl#organism')

        let construct = this.experiment.construct as S2Implementation

        await this.datastore.fetchEverything(this.graph, construct) 

        this.construct_uri = construct.uri

        this.construct = construct.displayName


        // TODO reimplement

        /*
        let activity_sbol = await DefaultSBOLFetcher.get(req).fetchSBOLObjectRecursive(this.meta.wasGeneratedBy.uri)
        let activity_sbol_object = activity_sbol.object as S2ProvActivity

        let plan_uri = activity_sbol_object.associations[0].plan.uri.toString()
        
        let plan_sbol = await DefaultSBOLFetcher.get(req).fetchSBOLObjectRecursive(plan_uri)
        
        this.meta.description = this.meta.description.split('<br/>').join('')
        this.agent = activity_sbol_object.associations[0].agent.name
        this.plan = activity_sbol_object.associations[0].plan.name

        this.meta.attachments = getAttachmentsFromTopLevel(plan_sbol, plan_sbol.object, req.url.toString().endsWith('/share'))
        this.plan_url = this.meta.attachments[0]['url'] + '/download'

        this.metadata = getAttachmentsFromTopLevel(activity_sbol, activity_sbol.object, req.url.toString().endsWith('/share'))[0]

        this.organism = this.annotations[4]['value']
        this.taxId = this.annotations[0]['uri']

        const { graphUri, uri, designId, baseUri, url } = getUrisFromReq(req)

        var templateParams = {
            uri: uri
        }

        var getAttachmentsQuery = loadTemplate('sparql/GetAttachments.sparql', templateParams)

		let dataurlAttachmentList = await sparql.queryJson(getAttachmentsQuery, graphUri)

        let dataurlAttachment = await getAttachmentsFromList(graphUri, dataurlAttachmentList,
            req.url.toString().endsWith('/share'))


        for (let attachment of dataurlAttachment){
            if (attachment['size'] === 0){
                this.meta.dataurl = attachment['url']
            }

        }*/

    }

    async render(res:Response) {

        res.render('templates/views/Experiment.jade', this)

    }
}