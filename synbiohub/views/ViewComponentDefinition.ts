
import filterAnnotations from 'synbiohub/filterAnnotations';
import sbolmeta = require('sbolmeta');
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
import { URI } from 'sboljs';
import sha1 = require('sha1');
import getUrisFromReq from 'synbiohub/getUrisFromReq';
import uriToUrl from 'synbiohub/uriToUrl';
import ViewTopLevelWithObject from 'synbiohub/views/ViewTopLevelWithObject';

import SBOLDocument = require('sboljs')

import { Request, Response } from 'express'

export default class ViewComponentDefinition extends ViewTopLevelWithObject {

    constructor() {
        super()
    }

    meta:any

    roles:Array<any>
    types:Array<any>
    components:Array<any>
    displayList:any

    async prepare(req:Request) {

        await super.prepare(req)

        this.rdfType = {
            name: 'ComponentDefinition'
        }

        this.setTopLevelMetadata(req, sbolmeta.summarizeComponentDefinition(this.object))

        this.types = this.object.types
        this.roles = this.object.roles


        this.components = this.object.components

        for(let component of this.components) {
            component.link()
            if (component.definition.uri) {
                if (component.definition.uri.toString().startsWith(config.get('databasePrefix'))) {
                    component.url = '/'  + component.definition.uri.toString().replace(config.get('databasePrefix'),'')
                } else {
                    component.url = component.definition.uri
                }
            } else {
                component.url = component.definition.toString()
            }
            component.typeStr = component.access.toString().replace('http://sbols.org/v2#','')
        }

        
        for(let sequence of this.meta.sequences) {
            if (sequence.uri.toString().startsWith(config.get('databasePrefix'))) {
                sequence.url = '/' + sequence.uri.toString().replace(config.get('databasePrefix'), '')
                if (sequence.uri.toString().startsWith(config.get('databasePrefix') + 'user/') && req.url.toString().endsWith('/share')) {
                    sequence.url += '/' + sha1('synbiohub_' + sha1(sequence.uri) + config.get('shareLinkSalt')) + '/share'
                }
            } else {
                sequence.url = sequence.uri
            }

            if (req.params.version === 'current') {
                sequence.url = sequence.url.toString().replace('/' + sequence.version, '/current')
                sequence.version = 'current'
            }
        }


        let types = this.object.types.map((type) => type.toString())

        let isDNA = types.indexOf(SBOLDocument.terms.dnaRegion) !== -1

        if (isDNA) {
            this.meta.displayList = getDisplayList(this.object, config, req.url.toString().endsWith('/share'))
        }


        if(isDNA) {
            this.meta.topLevelHumanType = 'DNA Part'
        } else if(types.indexOf(SBOLDocument.terms.rnaRegion) !== -1) {
            this.meta.topLevelHumanType = 'RNA Part'
        } else if(types.indexOf(SBOLDocument.terms.protein) !== -1) {
            this.meta.topLevelHumanType = 'Protein'
        } else if(types.indexOf(SBOLDocument.terms.smallMolecule) !== -1) {
            this.meta.topLevelHumanType = 'Small Molecule'
        } else {
            this.meta.topLevelHumanType = 'Part'
        }
    }

    async render(res:Response) {

        res.render('templates/views/componentDefinition.jade', this)

    }
}


