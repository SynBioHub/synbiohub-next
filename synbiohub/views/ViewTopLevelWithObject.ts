
import ViewTopLevel from "synbiohub/views/ViewTopLevel";
import DefaultSBOLFetcher from "../fetch/DefaultSBOLFetcher";
import wiky from "synbiohub/wiky/wiky";
import shareImages from "synbiohub/shareImages";
import * as attachments from 'synbiohub/attachments'
import config from "synbiohub/config";
import sha1 = require('sha1')
import loadTemplate from 'synbiohub/loadTemplate';
import {queryJson} from '../sparql/sparql';

import { Request, Response } from 'express'
import filterAnnotations from "../filterAnnotations";
import getCitationsForSubject from "./getCitationsForSubject";
import DefaultMDFetcher from "../fetch/DefaultMDFetcher";
import Breadcrumbs from "../Breadcrumbs";
import { SBHRequest } from "synbiohub/SBHRequest";
import { S2Identified, SBOL2Graph } from "sbolgraph";
import Mutables from "synbiohub/views/Mutables";

export default abstract class ViewTopLevelWithObject extends ViewTopLevel {

    constructor() {
        super()
    }

    sbol:SBOL2Graph
    object:S2Identified

    breadcrumbs:Breadcrumbs

    sbolUrl:string
    searchUsesUrl:string
    canEdit:boolean
    remote:any
    annotations:Array<any>
    submissionCitations:Array<any>
    collections:Array<any>
    builds:Array<any>
    mutables:Mutables

    async prepare(req:SBHRequest) {

        await super.prepare(req)

        let result = await DefaultSBOLFetcher.get(req).fetchSBOLObjectRecursive(this.uri)

        this.sbol = result.sbol
        this.object = result.object
        this.remote = result.remote

        this.buildTopLevelMenus(this.object.displayId)

        this.mutables = new Mutables(this.object)

        this.breadcrumbs = await Breadcrumbs.fromTopLevelObject(req, this.object)

        this.sbolUrl = this.uri.toURL() + '/' + this.object.displayId + '.xml'
        this.searchUsesUrl = this.uri.toURL() + '/uses'

        this.remote = null

        this.canEdit = false

        if(!this.remote && req.user) {

            const ownedBy = this.object.getUriProperties('http://wiki.synbiohub.org/wiki/Terms/synbiohub#ownedBy')
            const userUri = config.get('databasePrefix') + 'user/' + req.user.username

            if(ownedBy && ownedBy.indexOf(userUri) > -1) {
                this.canEdit = true
            }

        }

        /*
        this.annotations = filterAnnotations(req, this.object.annotations)

        this.annotations.forEach((annotation) => {
            if (annotation.name === 'benchling#edit' && req.params.version === 'current') {
                this.remote = { name: 'Benchling',
                    url: annotation.url
                }
            } else if (annotation.name === 'ice#entry' && req.params.version === 'current') {
                this.remote = { name: 'ICE',
                    url: annotation.url
                }
            }
        })*/

        this.submissionCitations = await getCitationsForSubject(this.uri, this.uri.getGraph())

        this.collections = await DefaultMDFetcher.get(req).getContainingCollections(this.uri)

        let query = loadTemplate('sparql/getImplementations.sparql', {
            uri: this.uri.toURI()
        })

        let query_results:any = await queryJson(query, this.uri.getGraph())
        
        query_results = JSON.parse(JSON.stringify(query_results))

        this.builds = []

        for(let impl of query_results){
            // console.log(impl)

            this.builds.push(impl['s'])

        }

    }

    async render(res:Response) {
        throw new Error("Method not implemented.");
    }




}

