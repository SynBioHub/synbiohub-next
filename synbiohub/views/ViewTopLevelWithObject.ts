
import ViewTopLevel from "synbiohub/views/ViewTopLevel";
import DefaultSBOLFetcher from "../fetch/DefaultSBOLFetcher";
import SBOLDocument = require('sboljs')
import wiky from "synbiohub/wiky/wiky";
import shareImages from "synbiohub/shareImages";
import * as attachments from 'synbiohub/attachments'
import config from "synbiohub/config";
import uriToUrl from "synbiohub/uriToUrl";
import sha1 = require('sha1')

import { Request, Response } from 'express'
import filterAnnotations from "../filterAnnotations";
import getCitationsForSubject from "./getCitationsForSubject";
import DefaultMDFetcher from "../fetch/DefaultMDFetcher";
import Breadcrumbs from "../Breadcrumbs";
import { SBHRequest } from "synbiohub/SBHRequest";

export default abstract class ViewTopLevelWithObject extends ViewTopLevel {

    constructor() {
        super()
    }

    sbol:SBOLDocument
    object:any

    breadcrumbs:Breadcrumbs

    sbolUrl:string
    searchUsesUrl:string
    canEdit:boolean
    remote:any
    annotations:Array<any>
    submissionCitations:Array<any>
    collections:Array<any>

    async prepare(req:SBHRequest) {

        await super.prepare(req)

        let result = await DefaultSBOLFetcher.get(req).fetchSBOLObjectRecursive(this.uriInfo.uri)

        this.sbol = result.sbol
        this.object = result.object
        this.remote = result.remote

        this.breadcrumbs = await Breadcrumbs.fromTopLevelObject(req, this.object)

        this.sbolUrl = this.uriInfo.url + '/' + this.object.displayId + '.xml'

        if(req.params.userId) {
            this.searchUsesUrl = '/user/' + encodeURIComponent(req.params.userId) + '/' + this.uriInfo.designId + '/uses'
        } else {
            this.searchUsesUrl = '/public/' + this.uriInfo.designId + '/uses'
        }

        this.remote = null

        this.canEdit = false

        if(!this.remote && req.user) {

            const ownedBy = this.object.getAnnotations('http://wiki.synbiohub.org/wiki/Terms/synbiohub#ownedBy')
            const userUri = config.get('databasePrefix') + 'user/' + req.user.username

            if(ownedBy && ownedBy.indexOf(userUri) > -1) {
                this.canEdit = true
            }

        }

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
        })

        this.submissionCitations = await getCitationsForSubject(this.uriInfo.uri, this.uriInfo.graphUri)

        this.collections = await DefaultMDFetcher.get(req).getContainingCollections(this.uriInfo.uri)

    }

    async render(res:Response) {
        throw new Error("Method not implemented.");
    }



    // TODO get rid of this
    meta:any
     
    protected setTopLevelMetadata(req:SBHRequest, meta:any) {

        meta.attachments = attachments.getAttachmentsFromTopLevel(this.sbol, this.object,
            req.url.toString().endsWith('/share'))

        if (this.object.wasGeneratedBy) {
            meta.wasGeneratedBy = {
                uri: this.object.wasGeneratedBy.uri ? this.object.wasGeneratedBy.uri : this.object.wasGeneratedBy,
                url: uriToUrl(this.object.wasGeneratedBy, req)
            }
        }
        
        super.setTopLevelMetadata(req, meta)
    }



}

