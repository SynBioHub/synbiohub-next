
import { Request, Response } from 'express'
import { getAttachmentsForSubject } from "synbiohub/attachments";
import DefaultMDFetcher from "synbiohub/fetch/DefaultMDFetcher";

import extend = require('xtend')
import ViewTopLevelWithObject from "synbiohub/views/ViewTopLevelWithObject";

import sbolmeta = require('sbolmeta')
import { SBHRequest } from 'synbiohub/SBHRequest';
import Breadcrumbs, { Breadcrumb } from 'synbiohub/Breadcrumbs';

export default class ViewCollection extends ViewTopLevelWithObject {

    breadcrumbs:Breadcrumbs

    constructor() {

        super()

    }

    async prepare(req:SBHRequest) {

        await super.prepare(req)

        this.rdfType = {
            name: 'Collection',
        }

        let meta:any = sbolmeta.summarizeGenericTopLevel(this.object)

        this.breadcrumbs = new Breadcrumbs([
            new Breadcrumb('/projects', 'Projects'),
            new Breadcrumb(this.uriInfo.url, meta.name)
        ])

        meta.members = []

        this.setTopLevelMetadata(req, meta)
    }

    async render(res:Response) {

        res.render('templates/views/collection.jade', this)

    }
}
