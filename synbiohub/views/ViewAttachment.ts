
import ViewDescribingTopLevel from './ViewDescribingTopLevel';

import { Request, Response } from 'express'
import { SBHRequest } from 'synbiohub/SBHRequest';

export default class ViewAttachment extends ViewDescribingTopLevel {

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
        this.attachmentDownloadURL = this.uri.toURL() + '/download'
        this.size = this.object.getIntProperty('http://wiki.synbiohub.org/wiki/Terms/synbiohub#attachmentSize')

        this.attachmentIsImage = this.attachmentType === 'http://wiki.synbiohub.org/wiki/Terms/synbiohub#imageAttachment'
    }

    async render(res:Response) {

        res.render('templates/views/attachment.jade', this)

    }
}


