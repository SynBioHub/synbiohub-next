
import View from "synbiohub/views/View";
import { SBHRequest } from "synbiohub/SBHRequest";
import { Response } from 'express'
import Breadcrumbs, { Breadcrumb } from "../Breadcrumbs";
import loadTemplate from "synbiohub/loadTemplate";
import * as sparql from 'synbiohub/sparql/sparql'
import config from "synbiohub/config";
import SBHURI from "../SBHURI";
import { S2Collection, SBOL2Graph } from "sbolgraph";
import SBOLUploader from "../SBOLUploader";
import OverwriteMerge, { OverwriteMergeOption } from "../OverwriteMerge";

export default class ViewNewProject extends View {

    errors:any[]

    breadcrumbs:Breadcrumbs

    projectInfo:any

    redirect:string|null

    constructor() {

        super()

        this.errors = []

        this.breadcrumbs = new Breadcrumbs([
            new Breadcrumb('/projects', 'Projects'),
            new Breadcrumb('/newProject', 'New Project')
        ])

        this.projectInfo = {
            name: '',
            desc: '',
            id: '',
            version: '1'
        }

    }

    async prepare(req:SBHRequest) {

        await super.prepare(req)

        this.redirect = null

        if(req.method === 'POST') {
            this.projectInfo.name = req.body.name
            this.projectInfo.desc = req.body.description
            this.projectInfo.id = req.body.id
            this.projectInfo.version = req.body.version

            await this.post(req)
        }
    }

    async render(res:Response) {

        if(this.redirect) {
            res.redirect(this.redirect)
        } else {
            res.render('templates/views/newProject.jade', this)
        }

    }

    async post(req:SBHRequest) {

        this.errors = []

        let uri = new SBHURI(req.user.username, this.projectInfo.id, this.projectInfo.id + '_collection', this.projectInfo.version)

        let graph:SBOL2Graph = new SBOL2Graph()
        let collection:S2Collection = graph.createCollection(uri.getURIPrefix(), uri.getDisplayId(), uri.getVersion())

        collection.name = this.projectInfo.name
        collection.description = this.projectInfo.desc
        collection.setUriProperty('http://wiki.synbiohub.org/wiki/Terms/synbiohub#ownedBy', uri.getUserURI())

        let uploader = new SBOLUploader()
        uploader.setGraph(graph)
        uploader.setDestinationGraphUri(uri.getGraph())
        uploader.setOverwriteMerge(OverwriteMergeOption.FailIfExists)
        await uploader.upload()

        this.redirect = uri.toURL()
    }

}

