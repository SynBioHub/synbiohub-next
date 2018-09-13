

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
import { S2ModuleDefinition } from 'sbolgraph';

export default class ViewModuleDefinition extends ViewDescribingTopLevel {

    constructor() {
        super()
    }

    moduleDefinition:S2ModuleDefinition
    
    modules:Array<any>
    roles:Array<any>
    models:Array<any>
    functionalComponents:Array<any>
    interactions:Array<any>

    async prepare(req:SBHRequest) {

        await super.prepare(req)

        this.rdfType = {
            name: 'ModuleDefinition'
        }

        this.moduleDefinition = this.object as S2ModuleDefinition

        this.modules = (this.object as S2ModuleDefinition).modules

        this.functionalComponents = (this.object as S2ModuleDefinition).functionalComponents

        this.interactions = (this.object as S2ModuleDefinition).interactions

        this.models = (this.object as S2ModuleDefinition).models

        

    }

    async render(res:Response) {

        res.render('templates/views/moduleDefinition.jade', this)

    }
}


