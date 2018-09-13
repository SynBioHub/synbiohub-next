
import filterAnnotations from 'synbiohub/filterAnnotations';
import shareImages from 'synbiohub/shareImages';
import loadTemplate from 'synbiohub/loadTemplate';
import formatSequence = require('sequence-formatter');
import async = require('async');
import prefixify from 'synbiohub/prefixify';
import pug = require('pug');
import * as sparql from 'synbiohub/sparql/sparql-collate';
import getDisplayList = require('visbol/lib/getDisplayList')
import wiky from 'synbiohub/wiky/wiky.js';
import config from 'synbiohub/config';
import sha1 = require('sha1');
import ViewDescribingTopLevel from './ViewDescribingTopLevel';

import { Request, Response } from 'express'
import { SBHRequest } from 'synbiohub/SBHRequest';
import { Specifiers, uriToName } from 'bioterms';
import { S2ComponentDefinition } from 'sbolgraph';

export default class ViewComponentDefinition extends ViewDescribingTopLevel {

    constructor() {
        super()
    }

    componentDefinition:S2ComponentDefinition
    
    topLevelHumanType:String

    displayList:any

    roleNames:any
    
    typeNames:any

    async prepare(req:SBHRequest) {

        await super.prepare(req)

        this.rdfType = {
            name: 'ComponentDefinition'
        }

        this.componentDefinition = this.object as S2ComponentDefinition

        let types = (this.object as S2ComponentDefinition).types

        let isDNA = types.indexOf(Specifiers.SBOL2.Type.DNA) !== -1

        // visbol was here


        if(isDNA) {
            this.topLevelHumanType = 'DNA Part'
        } else if(types.indexOf(Specifiers.SBOL2.Type.RNA) !== -1) {
            this.topLevelHumanType = 'RNA Part'
        } else if(types.indexOf(Specifiers.SBOL2.Type.Protein) !== -1) {
            this.topLevelHumanType = 'Protein'
        } else if(types.indexOf(Specifiers.SBOL2.Type.SmallMolecule) !== -1) {
            this.topLevelHumanType = 'Small Molecule'
        } else {
            this.topLevelHumanType = 'Part'
        }


        for(let sequence of this.componentDefinition.sequences) {
            await this.datastore.fetchMetadata(this.graph, sequence)
        }

        this.roleNames = []

        for(let role of this.componentDefinition.roles) {

            if (!(role.indexOf('/SO:') === -1)){
                this.roleNames.push({'name' : await uriToName(role), 'uri' : role})
            }

            else{
                this.roleNames.push({'name' : role.split('/').pop(), 'uri' : role})
                
            }

            
        }

        this.typeNames = []

        for(let type of this.componentDefinition.types) {

            this.typeNames.push({'name' : type.split('#').pop(), 'uri' : type})

        }
        
    }

    async render(res:Response) {

        res.render('templates/views/componentDefinition.jade', this)

    }
}


