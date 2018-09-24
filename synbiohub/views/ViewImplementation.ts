
import ViewDescribingTopLevel from './ViewDescribingTopLevel';

import {getAttachmentsFromTopLevel} from 'synbiohub/attachments';

import { Request, Response } from 'express'
import { SBHRequest } from 'synbiohub/SBHRequest';
import { Predicates } from 'bioterms'
import { S2ProvActivity, SBOL2Graph, S2ProvAssociation, S2Identified, S2ComponentDefinition } from 'sbolgraph'
import SBHURI from 'synbiohub/SBHURI';
import S2Implementation from 'sbolgraph/dist/sbol2/S2Implementation';

export default class ViewImplementation extends ViewDescribingTopLevel {

    constructor() {
        super()
    }


    implementation:S2Implementation

    design:string
    design_uri:string
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

        this.implementation = this.object as S2Implementation

        await this.datastore.fetchEverything(this.graph, this.implementation)

        let act = this.implementation.activity as S2ProvActivity

        this.location = this.implementation.getStringProperty('http://wiki.synbiohub.org/wiki/Terms/synbiohub#physicalLocation')

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

        this.taxId = this.implementation.getUriProperty('http://w3id.org/synbio/ont#taxId')

        this.organism = this.implementation.getUriProperty('http://www.biopax.org/release/biopax-level3.owl#organism')

        let design = this.implementation.design as S2ComponentDefinition //THIS GETTER IS ACTUALLY BROKEN DONT KNOW WHY HAVE TO FIX

        await this.datastore.fetchEverything(this.graph, design) 

        this.design_uri = design.uri

        this.design = design.displayName

    }


    async render(res:Response) {

        res.render('templates/views/implementation.jade', this)

    }
}