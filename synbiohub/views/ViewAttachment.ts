
import sbolmeta = require('sbolmeta');
import ViewTopLevelWithObject from 'synbiohub/views/ViewTopLevelWithObject';

import { Request, Response } from 'express'

export default class ViewAttachment extends ViewTopLevelWithObject {

    constructor() {
        super()
    }

    meta:any

    attachmentType:string
    attachmentHash:string
    attachmentDownloadURL:string
    size:string
    attachmentIsImage:boolean

    async prepare(req:Request) {

        await super.prepare(req)

        this.setTopLevelMetadata(req, sbolmeta.summarizeGenericTopLevel(this.object))

        this.attachmentType = this.object.getAnnotation('http://wiki.synbiohub.org/wiki/Terms/synbiohub#attachmentType')
        this.attachmentHash = this.object.getAnnotation('http://wiki.synbiohub.org/wiki/Terms/synbiohub#attachmentHash')
        this.attachmentDownloadURL = this.uriInfo.url + '/download'
        this.size = this.object.getAnnotation('http://wiki.synbiohub.org/wiki/Terms/synbiohub#attachmentSize')

        this.attachmentIsImage = this.attachmentType === 'http://wiki.synbiohub.org/wiki/Terms/synbiohub#imageAttachment'
    }

    async render(res:Response) {

        res.render('templates/views/attachment.jade', this)

    }
}


