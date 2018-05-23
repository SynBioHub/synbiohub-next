

import filterAnnotations from 'synbiohub/filterAnnotations';
import sbolmeta = require('sbolmeta');
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
import { URI } from 'sboljs';
import sha1 = require('sha1');
import getUrisFromReq from 'synbiohub/getUrisFromReq';
import uriToUrl from 'synbiohub/uriToUrl';
import ViewTopLevelWithObject from 'synbiohub/views/ViewTopLevelWithObject';

import { Request, Response } from 'express'

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

    async prepare(req:SBHRequest) {

        await super.prepare(req)

        this.setTopLevelMetadata(req, sbolmeta.summarizeModuleDefinition(this.object))

        this.roles = this.object.roles



        this.modules = this.object.modules

        for(let module of this.modules) {
            if (module.definition.uri) {
                module.defId = module.definition.displayId
                module.defName = module.definition.name
                console.log(module.definition.uri.toString())
                console.log(config.get('databasePrefix'))
                if (module.definition.uri.toString().startsWith(config.get('databasePrefix'))) {
                    module.url = '/' + module.definition.uri.toString().replace(config.get('databasePrefix'), '')
                    if (module.definition.uri.toString().startsWith(config.get('databasePrefix') + 'user/') && req.url.toString().endsWith('/share')) {
                        module.url += '/' + sha1('synbiohub_' + sha1(module.definition.uri.toString()) + config.get('shareLinkSalt')) + '/share'
                    }
                } else {
                    module.url = module.definition.uri.toString()
                }
            } else {
                module.defId = module.definition.toString()
                module.defName = ''
                module.url = module.definition.toString()
            }
        }


        this.models = this.object.models

        for(let model of this.models) {
            if (model.uri) {
                if (model.uri.toString().startsWith(config.get('databasePrefix'))) {
                    model.url = '/' + model.uri.toString().replace(config.get('databasePrefix'),'')
		    if (model.uri.toString().startsWith(config.get('databasePrefix')+'user/') && req.url.toString().endsWith('/share')) {
			model.url += '/' + sha1('synbiohub_' + sha1(model.uri.toString()) + config.get('shareLinkSalt')) + '/share'
		    }
                } else {
                    model.url = model.uri.toString()
                }
                model.version = model.uri.toString().substring(model.uri.toString().lastIndexOf('/')+1)
                var persId = model.uri.toString().substring(0,model.uri.toString().lastIndexOf('/'))
                model.id = persId.substring(persId.lastIndexOf('/')+1)
            } else {
                model.url = model.toString()
                model.id = model.toString()
                model.name = ''
            }
        }


        this.functionalComponents = this.object.functionalComponents

        for(let functionalComponent of this.functionalComponents) {
            functionalComponent.link()
            if (functionalComponent.definition.uri) {
                functionalComponent.defId = functionalComponent.definition.displayId
                functionalComponent.defName = functionalComponent.definition.name
                if (functionalComponent.definition.uri.toString().startsWith(config.get('databasePrefix'))) {
                    functionalComponent.url = '/' + functionalComponent.definition.uri.toString().replace(config.get('databasePrefix'), '')
                    if (functionalComponent.definition.uri.toString().startsWith(config.get('databasePrefix') + 'user/') && req.url.toString().endsWith('/share')) {
                        functionalComponent.url += '/' + sha1('synbiohub_' + sha1(functionalComponent.definition.uri.toString()) + config.get('shareLinkSalt')) + '/share'
                    }
                } else {
                    functionalComponent.url = functionalComponent.definition.uri.toString()
                }
            } else {
                functionalComponent.defId = functionalComponent.definition.toString()
                functionalComponent.defName = ''
                functionalComponent.url = functionalComponent.definition.toString()
            }
            functionalComponent.typeStr = functionalComponent.access.toString().replace('http://sbols.org/v2#', '') + ' '
                + functionalComponent.direction.toString().replace('http://sbols.org/v2#', '').replace('none', '')

        }


        this.interactions = this.object.interactions

        for(let interaction of this.interactions) {
            interaction.typeStr = ''
            interaction.types.forEach((type) => {
                var sboPrefix = 'http://identifiers.org/biomodels.sbo/'
                if (type.toString().indexOf(sboPrefix) === 0) {
                    var sboTerm = type.toString().slice(sboPrefix.length).split('_').join(':')
                    interaction.typeStr = sbolmeta.systemsBiologyOntology[sboTerm].name
                    interaction.typeURL = type.toString()
                }
            })
            interaction.defId = interaction.displayId
            interaction.defName = interaction.name ? interaction.name : interaction.displayId
            interaction.participations.forEach((participation) => {
                participation.roleStr = ''
                participation.roles.forEach((role) => {
                    var sboPrefix = 'http://identifiers.org/biomodels.sbo/'
                    if (role.toString().indexOf(sboPrefix) === 0) {
                        var sboTerm = role.toString().slice(sboPrefix.length).split('_').join(':')
                        participation.roleStr = sbolmeta.systemsBiologyOntology[sboTerm].name
                        participation.roleURL = role.toString()
                    }
                })
                if (participation.participant.definition.uri) {
                    if (participation.participant.definition.uri.toString().startsWith(config.get('databasePrefix'))) {
                        participation.url = '/' + participation.participant.uri.toString().replace(config.get('databasePrefix'), '')
                        if (participation.participant.definition.uri.toString().startsWith(config.get('databasePrefix') + 'user/') && req.url.toString().endsWith('/share')) {
                            participation.participant.url += '/' + sha1('synbiohub_' + sha1(participation.participant.definition.uri.toString()) + config.get('shareLinkSalt')) + '/share'
                        }
                    } else {
                        participation.participant.url = participation.participant.definition.uri.toString()
                    }
                    participation.participant.defId = participation.participant.definition.displayId
                    participation.participant.defName = participation.participant.definition.name ? participation.participant.definition.name : participation.participant.definition.displayId
                } else {
                    participation.participant.defId = participation.participant.displayId
                    participation.participant.defName = participation.participant.name ? participation.participant.name : participation.participant.displayId
                    participation.participant.url = participation.participant.definition.toString()
                }

            })
        }

    }

    async render(res:Response) {

        res.render('templates/views/moduleDefinition.jade', this)

    }
}


