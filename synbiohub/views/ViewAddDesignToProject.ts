
import View from "synbiohub/views/View";
import { SBHRequest } from "synbiohub/SBHRequest";
import { Response } from 'express'
import Breadcrumbs, { Breadcrumb } from "../Breadcrumbs";
import loadTemplate from "synbiohub/loadTemplate";
import * as sparql from 'synbiohub/sparql/sparql'
import config from "synbiohub/config";
import DefaultMDFetcher from "../fetch/DefaultMDFetcher";
import parseForm from "../parseForm";
import fs = require('mz/fs')
import tmp = require('tmp-promise')
import SBHURI from "synbiohub/SBHURI";

export default class ViewAddDesignToProject extends View {

    errors:any[]

    breadcrumbs:Breadcrumbs

    project:any

    redirect:string|null
    
    submission:any

    constructor() {

        super()

        this.errors = []

        this.submission = {
            file: ''
        }

    }

    async prepare(req:SBHRequest) {

        await super.prepare(req)

        let projectUri = SBHURI.fromURIOrURL(req.url)

        this.project = await DefaultMDFetcher.get(req).getCollectionMetadata(projectUri)

        if(!this.project) {
            throw new Error('getCollectionMetadata returned nothing for ' + projectUri)
        }

        this.breadcrumbs = new Breadcrumbs([
            new Breadcrumb('/projects', 'Projects'),
            new Breadcrumb(projectUri.toURL(), this.project.name),
            new Breadcrumb('/addDesignToProject', 'Add Design')
        ])

        this.redirect = null

        if(req.method === 'POST') {
            await this.post(req)
        }
    }

    async render(res:Response) {

        if(this.redirect) {
            res.redirect(this.redirect)
        } else {
            res.render('templates/views/addDesignToProject.jade', this)
        }

    }

    async post(req:SBHRequest) {

        this.errors = []

        let { fields, files } = await parseForm(req)

        let tmpFilename = await saveTempFile()

        async function saveTempFile() {

            if (files.file) {

                return Promise.resolve(files.file[0].path)

            } else {

                let tmpFilename = await tmp.tmpName()

                await fs.writeFile(tmpFilename, fields.file[0])

                return tmpFilename

            }
        }
    }

}

