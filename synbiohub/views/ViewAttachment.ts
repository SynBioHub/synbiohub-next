
import ViewTopLevelWithObject from 'synbiohub/views/ViewTopLevelWithObject';

import { Request, Response } from 'express'
import { SBHRequest } from 'synbiohub/SBHRequest';

export default class ViewAttachment extends ViewTopLevelWithObject {

    constructor() {
        super()
    }

    meta:any

    attachmentType:string
    attachmentHash:string
    attachmentDownloadURL:string
    size:number
    attachmentIsImage:boolean

    async prepare(req:SBHRequest) {

        await super.prepare(req)

        this.attachmentType = this.object.getUriProperty('http://wiki.synbiohub.org/wiki/Terms/synbiohub#attachmentType')
        this.attachmentHash = this.object.getStringProperty('http://wiki.synbiohub.org/wiki/Terms/synbiohub#attachmentHash')
        this.attachmentDownloadURL = this.uriInfo.url + '/download'
        this.size = this.object.getIntProperty('http://wiki.synbiohub.org/wiki/Terms/synbiohub#attachmentSize')

        this.attachmentIsImage = this.attachmentType === 'http://wiki.synbiohub.org/wiki/Terms/synbiohub#imageAttachment'
    }

    async render(res:Response) {

        res.render('templates/views/attachment.jade', this)

    }
}


