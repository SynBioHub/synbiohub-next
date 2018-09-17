

import filterAnnotations from 'synbiohub/filterAnnotations';
import shareImages from 'synbiohub/shareImages';
import loadTemplate from 'synbiohub/loadTemplate';
import formatSequence = require('sequence-formatter');
import async = require('async');
import prefixify from 'synbiohub/prefixify';
import pug = require('pug');
import * as sparql from 'synbiohub/sparql/sparql-collate';
import getDisplayList from 'visbol/lib/getDisplayList';
import wiky from 'synbiohub/wiky/wiky.js';
import config from 'synbiohub/config';
import sha1 = require('sha1');
import ViewDescribingTopLevel from './ViewDescribingTopLevel';

import { Request, Response } from 'express'
import { SBHRequest } from 'synbiohub/SBHRequest';
import { S2ModuleDefinition, S2FunctionalComponent, S2Interaction } from 'sbolgraph';
import S2Participation from 'sbolgraph/dist/sbol2/S2Participation';


export default class ViewModuleDefinition extends ViewDescribingTopLevel {

    constructor() {
        super()
    }

    moduleDefinition:S2ModuleDefinition
    
    modules:Array<any>
    roles:Array<any>
    models:Array<any>
    functionalComponents:S2FunctionalComponent[]
    interactions:Array<S2Interaction>
    participations:Array<S2Participation>

    async prepare(req:SBHRequest) {

        await super.prepare(req)

        this.rdfType = {
            name: 'ModuleDefinition'
        }

        
        this.moduleDefinition = this.object as S2ModuleDefinition

        this.modules = this.moduleDefinition.modules

        this.functionalComponents = this.moduleDefinition.functionalComponents

        this.interactions = this.moduleDefinition.interactions

        this.models = this.moduleDefinition.models

        for(let functionalComponent of this.functionalComponents) {
            await this.datastore.fetchEverything(this.graph, functionalComponent)
            await this.datastore.fetchMetadata(this.graph, functionalComponent.definition)
        }

        for(let interaction of this.interactions) {
            await this.datastore.fetchEverything(this.graph, interaction)
            await this.datastore.fetchMetadata(this.graph, interaction)
        
            for(let participation of interaction.participations){
                await this.datastore.fetchEverything(this.graph, participation)
                await this.datastore.fetchMetadata(this.graph, participation)
            }
        }
        console.log('HI THERE')
        console.log(this.graph.serializeXML())

        console.log(this.interactions[0])

        
        // console.log(this.functionalComponents[0].name)

    }

    async render(res:Response) {

        res.render('templates/views/moduleDefinition.jade', this)

    }
}

