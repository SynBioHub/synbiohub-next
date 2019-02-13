
import { Request, Response } from 'express'

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

    components:any[]

    CDCheck: any[]

    typeBooleans: boolean[]

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

        this.components = []
        this.CDCheck = []
        let indexArray = []
        
        this.typeBooleans = [false, false, false]

        console.log(this.collection.members)

        for(let member of this.collection.members) {
            
            
            this.memberURLs.set(member.uri, SBHURI.fromURIOrURL(member.uri).toURL())


            console.log(member)
            if (member.objectType === Types.SBOL2.ComponentDefinition){

                this.typeBooleans[0] = true

                let tempCD = member as S2ComponentDefinition

                await this.datastore.fetchComponents(this.graph, tempCD)

                if (tempCD.components.length !== 0) {

                    let tempComponents = [tempCD]
                    this.CDCheck.push(tempCD.displayId)
                    
                    for(let component of tempCD.components) {
                        tempComponents.push(component.definition)
                        let index = this.collection.members.map(x => x.uri).indexOf(component.definition.uri)
                        if (index !== -1){
                            indexArray.push(index)

                        }
                    }

                    this.components.push(tempComponents)
                }

            }

            else if (member.objectType === Types.SBOL2.Implementation){
                this.typeBooleans[1] = true
            }

            else if (member.objectType === Types.SBOL2.Experiment){
                this.typeBooleans[2] = true
            }

            
        }

        await this.typeBoolean()

        for(let index of indexArray){

            this.collection.members[index].version = 'null'
            
        }
        
        this.breadcrumbs = new Breadcrumbs([
            new Breadcrumb('/projects', 'Projects'),
            new Breadcrumb(this.uri.toURL(), this.object.displayName)
        ])   

    }

    async render(res:Response) {

        res.render('templates/views/collection.jade', this)

    }

    async typeBoolean(){ 

        for(let member of this.collection.members) {

            if (member.objectType === Types.SBOL2.ComponentDefinition){

                this.typeBooleans[0] = true
            }

            else if (member.objectType === Types.SBOL2.Implementation){
                this.typeBooleans[1] = true
            }

            else if (member.objectType === Types.SBOL2.Experiment){
                this.typeBooleans[2] = true
            }
            
        }

    }

}
