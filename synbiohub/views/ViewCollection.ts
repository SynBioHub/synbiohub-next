
import { Request, Response } from 'express'
import { getAttachmentsForSubject } from "synbiohub/attachments";

import extend = require('xtend')
import ViewDescribingTopLevel from "./ViewDescribingTopLevel";

import { SBHRequest } from 'synbiohub/SBHRequest';
import Breadcrumbs, { Breadcrumb } from 'synbiohub/Breadcrumbs';
import { S2Collection, S2Identified, S2ComponentDefinition, S2ComponentInstance } from 'sbolgraph';
import SBHURI from '../SBHURI';
import { Types, Predicates } from 'bioterms';

export default class ViewCollection extends ViewDescribingTopLevel {

    breadcrumbs:Breadcrumbs

    collection:S2Collection

    memberURLs:Map<string,string>

    constructor() {

        super()

        this.memberURLs = new Map()

    }

    async prepare(req:SBHRequest) {

        await super.prepare(req)

        await this.datastore.fetchMembersMetadata(this.graph, this.object as S2Collection)
        this.rdfType = {
            name: 'Collection',
        }

        this.collection = this.object as S2Collection
        
        for(let member of this.collection.members) {
            this.memberURLs.set(member.uri, SBHURI.fromURIOrURL(member.uri).toURL())
            this.memberURLs.set(member.displayType, 'bla')

            if (member.objectType === Types.SBOL2.ComponentDefinition){

                let tempCD = member as S2ComponentDefinition

                await this.datastore.fetchComponents(this.graph, tempCD)

                for(let component of tempCD.components) {
                    console.log(component.definition)
                }

            }
        
        }

        this.breadcrumbs = new Breadcrumbs([
            new Breadcrumb('/projects', 'Projects'),
            new Breadcrumb(this.uri.toURL(), this.object.displayName)
        ])

        console.log('OBJECT IS ' + this.object)
        

    }

    async render(res:Response) {

        res.render('templates/views/collection.jade', this)

    }

}
