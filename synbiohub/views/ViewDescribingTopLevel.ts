
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
import Breadcrumbs from "../Breadcrumbs";
import { SBHRequest } from "synbiohub/SBHRequest";
import { S2Identified, SBOL2Graph, S2Attachment } from "sbolgraph";
import Mutables from "synbiohub/views/Mutables";
import Menu, { MenuItem } from "synbiohub/Menu";
import SBHURI from "synbiohub/SBHURI";
import ViewConcerningTopLevel from "./ViewConcerningTopLevel";

export default abstract class ViewDescribingTopLevel extends ViewConcerningTopLevel {

    constructor() {
        super()
    }

    topLevelDownloadMenu:Menu
    topLevelShareMenu:Menu
    topLevelOtherMenu:Menu

    object:S2Identified

    breadcrumbs:Breadcrumbs

    sbolUrl:string
    searchUsesUrl:string
    canEdit:boolean
    annotations:Array<any>
    submissionCitations:Array<any>
    collections:Array<any>
    //builds:Array<any>
    mutables:Mutables
    rdfType:any
    attachments:S2Attachment[]
    comment:string
    commentHistory:string[]

    async prepare(req:SBHRequest) {

        await super.prepare(req)

        this.uri = SBHURI.fromURIOrURL(req.url)

        // await this.datastore.fetchProperties(this.graph, new S2Identified(this.graph, this.uri.toURI()))

        await this.datastore.fetchTopLevel(this.graph, new S2Identified(this.graph, this.uri.toURI()))


        this.object = this.graph.uriToFacade(this.uri.toURI())

        this.buildTopLevelMenus(this.object.displayId)

        this.mutables = new Mutables(this.object)

        this.breadcrumbs = await Breadcrumbs.fromTopLevelURI(req, this.uri)

        this.sbolUrl = this.uri.toURL() + '/' + this.object.displayId + '.xml'
        this.searchUsesUrl = this.uri.toURL() + '/uses'

        this.canEdit = false

        await this.datastore.fetchAttachments(this.graph, this.object)

        this.attachments = this.object.attachments


        /* TODO

        if(!this.remote && req.user) {

            const ownedBy = this.object.getUriProperties('http://wiki.synbiohub.org/wiki/Terms/synbiohub#ownedBy')
            const userUri = config.get('databasePrefix') + 'user/' + req.user.username

            if(ownedBy && ownedBy.indexOf(userUri) > -1) {
                this.canEdit = true
            }

        }*/

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

        // breadcrumbs already got this
        this.collections = this.object.containingCollections

        /*
        let query = loadTemplate('sparql/getImplementations.sparql', {
            uri: this.uri.toURI()
        })

        let query_results:any = await queryJson(query, this.uri.getGraph())
        
        query_results = JSON.parse(JSON.stringify(query_results))

        this.builds = []

        for(let impl of query_results){
            // console.log(impl)

            this.builds.push(impl['s'])

        }*/

        let tempHistory = this.object.getUriProperties('http://www.w3.org/1999/02/22-rdf-syntax-ns#comment')

        if (tempHistory.length === 0){
            console.log('hello????')
            this.commentHistory = tempHistory
            this.comment = ''
        }
        else{

            let indices = tempHistory.map(x => x.split(' *** ').pop()).sort()
            
            tempHistory.sort(function(a,b) {
    
                let tempA = parseInt(a.split(' *** ').pop())
                let tempB = parseInt(b.split(' *** ').pop())
    
                let tempResult = tempB - tempA
                return tempResult
    
            })
    
            

            // let dates = tempHistory.map(x => x.split(' *** ')[1])
            tempHistory = tempHistory.map(x => x.split(' *** ')[0] + " - " +  x.split(' *** ')[1]) 
            this.commentHistory = tempHistory
    
            console.log(this.commentHistory)
            this.comment = this.commentHistory[0].split(" - ")[0]
        }


    }

    async render(res:Response) {
        throw new Error("Method not implemented.");
    }

    protected buildTopLevelMenus(id:string) {

        let url = this.uri.toURL()

        this.topLevelDownloadMenu = new Menu()
        this.topLevelDownloadMenu.addItem(new MenuItem('Download SBOL', url + '/' + id + '.xml', 'fa-download'))
        this.topLevelDownloadMenu.addItem(new MenuItem('Download COMBINE archive', url + '/' + id + '.omex', 'fa-download'))
        this.topLevelDownloadMenu.addItem(new MenuItem('Download GenBank', url + '/' + id + '.gb', 'fa-download'))
        this.topLevelDownloadMenu.addItem(new MenuItem('Download FASTA', url + '/' + id + '.fasta', 'fa-download'))
        this.topLevelDownloadMenu.addItem(new MenuItem('Download Image', '/sbol', 'fa-image'))

        this.topLevelShareMenu = new Menu()
        this.topLevelShareMenu.addItem(new MenuItem('Get Share Link', '/sbol', 'fa-link'))
        this.topLevelShareMenu.addItem(new MenuItem('Send to ICE', url + '/' + id + '/createICEPart', 'fa-external-link-alt'))
        this.topLevelShareMenu.addItem(new MenuItem('Add Owner', '/sbol', 'fa-users'))
        this.topLevelShareMenu.addItem(new MenuItem('Make Public', '/sbol', 'fa-globe'))

        this.topLevelOtherMenu = new Menu()
        this.topLevelOtherMenu.addItem(new MenuItem('Find Uses', url + '/' + id + '/uses', 'fa-search'))
        this.topLevelOtherMenu.addItem(new MenuItem('Find Matching Parts', url + '/' + id + '/twins', 'fa-search'))
        this.topLevelOtherMenu.addItem(new MenuItem('Delete Part', url + '/remove', 'fa-trash-alt'))

    }



}

