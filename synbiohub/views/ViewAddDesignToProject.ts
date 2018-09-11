
import { SBHRequest } from "synbiohub/SBHRequest";
import { Response } from 'express'
import Breadcrumbs, { Breadcrumb } from "../Breadcrumbs";
import parseForm from "../parseForm";
import fs = require('mz/fs')
import SBHURI from "synbiohub/SBHURI";
import ViewConcerningTopLevel from "./ViewConcerningTopLevel";
import { SBOL2Graph, S2Collection, node } from 'sbolgraph'
import SBOLUploader from "../SBOLUploader";
import { OverwriteMergeOption } from "../OverwriteMerge";
import { Predicates, Types } from 'bioterms'

export default class ViewAddDesignToProject extends ViewConcerningTopLevel {

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

        this.breadcrumbs = new Breadcrumbs([
            new Breadcrumb('/projects', 'Projects'),
            new Breadcrumb(this.uri.toURL(), this.object.name),
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

        let filePath = files.file[0].path
        let contents = (await fs.readFile(filePath)).toString()


        console.log('uploading ' + contents)

        let g:SBOL2Graph = await SBOL2Graph.loadString(contents)

        g.changeURIPrefix(this.uri.getURIPrefix())

        for(let topLevel of g.topLevels) {
            g.add(this.uri.toURI(), Predicates.a, node.createUriNode(Types.SBOL2.Collection)) // needed for sbolgraph to serialize to xml
            g.add(this.uri.toURI(), Predicates.SBOL2.member, node.createUriNode(topLevel.uri))
        }

        let uploader = new SBOLUploader()
        uploader.setGraph(g)
        uploader.setDestinationGraphUri(req.user.graphUri)
        uploader.setOverwriteMerge(OverwriteMergeOption.FailIfExists)

        await uploader.upload()

        this.redirect = this.uri.toURL()
    }

}

