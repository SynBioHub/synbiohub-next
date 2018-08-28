
import View from "synbiohub/views/View";
import { SBHRequest } from "synbiohub/SBHRequest";
import { Response } from 'express'
import Breadcrumbs, { Breadcrumb } from "../Breadcrumbs";
import loadTemplate from "synbiohub/loadTemplate";
import * as sparql from 'synbiohub/sparql/sparql'
import config from "synbiohub/config";
import uriToUrl from "synbiohub/uriToUrl";
import splitUri from "synbiohub/splitUri";

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

        // TODO factor out URI generation
        let persistentIdentity = config.get('databasePrefix') +
            'user/' + req.user.username + '/' + this.projectInfo.id + '/' + this.projectInfo.id

        let uri = persistentIdentity + '/' + this.projectInfo.version

        let query = loadTemplate('sparql/CreateProject.sparql', {
            uri: sparql.escapeIRI(uri),
            name: sparql.escapeString(this.projectInfo.name),
            desc: sparql.escapeString(this.projectInfo.desc),
            id: sparql.escapeString(this.projectInfo.id),
            version: sparql.escapeString(this.projectInfo.version),
            ownedBy: sparql.escapeIRI(config.get('databasePrefix') + 'user/' + req.user.username),
            persistentIdentity: sparql.escapeIRI(persistentIdentity)
        })

        try {
            let result = await sparql.updateQueryJson(query, req.user.graphUri)
            this.redirect = uriToUrl(uri, req)
        } catch(e) {
            this.errors.push(e)
        }
    }

}

