
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
import getUrisFromReq from 'synbiohub/getUrisFromReq';
import uriToUrl from 'synbiohub/uriToUrl';
import ViewTopLevelWithObject from 'synbiohub/views/ViewTopLevelWithObject';

import { Request, Response } from 'express'
import { SBHRequest } from 'synbiohub/SBHRequest';
import { Specifiers } from 'bioterms';
import { S2ComponentDefinition } from 'sbolgraph';

export default class ViewComponentDefinition extends ViewTopLevelWithObject {

    constructor() {
        super()
    }

    meta:any

    displayList:any

    async prepare(req:SBHRequest) {

        await super.prepare(req)

        this.rdfType = {
            name: 'ComponentDefinition'
        }

        let types = (this.object as S2ComponentDefinition).types

        let isDNA = types.indexOf(Specifiers.SBOL2.Type.DNA) !== -1

        if (isDNA) {
            this.meta.displayList = getDisplayList(this.object, config, req.url.toString().endsWith('/share'))
        }


        if(isDNA) {
            this.meta.topLevelHumanType = 'DNA Part'
        } else if(types.indexOf(Specifiers.SBOL2.Type.RNA) !== -1) {
            this.meta.topLevelHumanType = 'RNA Part'
        } else if(types.indexOf(Specifiers.SBOL2.Type.Protein) !== -1) {
            this.meta.topLevelHumanType = 'Protein'
        } else if(types.indexOf(Specifiers.SBOL2.Type.SmallMolecule) !== -1) {
            this.meta.topLevelHumanType = 'Small Molecule'
        } else {
            this.meta.topLevelHumanType = 'Part'
        }
    }

    async render(res:Response) {

        res.render('templates/views/componentDefinition.jade', this)

    }
}


