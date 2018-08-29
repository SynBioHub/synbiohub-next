

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
import getUrisFromReq from 'synbiohub/getUrisFromReq';
import ViewTopLevelWithObject from 'synbiohub/views/ViewTopLevelWithObject';

import { Request, Response } from 'express'
import { SBHRequest } from 'synbiohub/SBHRequest';
import { S2ModuleDefinition } from 'sbolgraph';

export default class ViewModuleDefinition extends ViewTopLevelWithObject {

    constructor() {
        super()
    }

    meta:any

    modules:Array<any>
    roles:Array<any>
    models:Array<any>
    functionalComponents:Array<any>
    interactions:Array<any>

    get moduleDefinition() {
        return this.object as S2ModuleDefinition
    }

    async prepare(req:SBHRequest) {

        await super.prepare(req)

    }

    async render(res:Response) {

        res.render('templates/views/moduleDefinition.jade', this)

    }
}


