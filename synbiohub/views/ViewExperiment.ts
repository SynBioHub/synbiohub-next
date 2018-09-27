
import ViewDescribingTopLevel from './ViewDescribingTopLevel';

import {getAttachmentsFromTopLevel, getAttachmentsFromList} from 'synbiohub/attachments';
import loadTemplate from '../loadTemplate';

import { Request, Response } from 'express'
import { SBHRequest } from 'synbiohub/SBHRequest';
var sparql = require('../sparql/sparql')

import { S2ProvActivity, SEP21Experiment, S2ProvAssociation, S2Implementation, SEP21ExperimentalData, S2Identified, S2ProvUsage, S2Attachment } from 'sbolgraph'

export default class ViewExperiment extends ViewDescribingTopLevel{

    constructor(){
        super()
    }

    meta:any

    experiment:SEP21Experiment
    experimentalData:S2Identified[]

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

        let usg = act.usage as S2ProvUsage
        
        await this.datastore.fetchEverything(this.graph, usg)
        
        let asc = act.association as S2ProvAssociation

        await this.datastore.fetchEverything(this.graph, asc)

        let agent = asc.agent

        await this.datastore.fetchEverything(this.graph, agent)

        let plan = asc.plan
        
        await this.datastore.fetchEverything(this.graph, plan)

        await this.datastore.fetchAttachments(this.graph, plan)

        for (let attachment of plan.attachments){
            await this.datastore.fetchEverything(this.graph, attachment)
        }

        this.agent = agent.displayName

        this.plan = plan.displayName

        this.plan_url = plan.uri

        this.taxId = this.experiment.getUriProperty('http://w3id.org/synbio/ont#taxId')

        this.organism = this.experiment.getUriProperty('http://www.biopax.org/release/biopax-level3.owl#organism')

        this.dataurl = this.experiment.getUriProperty('http://purl.obolibrary.org/obo/NCIT_C114457')

        let construct = this.experiment.construct as S2Implementation

        await this.datastore.fetchEverything(this.graph, construct) 

        this.construct_uri = construct.uri

        this.construct = construct.displayName

        console.log(this.graph.serializeXML())

        this.experimentalData = this.experiment.experimentalData

        for (let data of this.experimentalData){
            await this.datastore.fetchAttachments(this.graph, data) as S2Attachment
        }
    }

    async render(res:Response) {

        res.render('templates/views/Experiment.jade', this)

    }
}