
import ViewDescribingTopLevel from './ViewDescribingTopLevel';

import { Request, Response } from 'express'
import config from 'synbiohub/config';

import sha1 = require('sha1')
import { SBHRequest } from 'synbiohub/SBHRequest';
import { S2Attachment } from 'sbolgraph';

export default class ViewSBOLAttachment extends ViewDescribingTopLevel {

    constructor() {
        super()
    }

    meta:any

    attachmentName:string
    attachmentType:string
    attachmentDownloadURL:string
    attachmentHash:string
    size:string
    attachmentIsImage:boolean

    async prepare(req:SBHRequest) {

        await super.prepare(req)


        let attachment = this.object as S2Attachment

        this.attachmentType = attachment.format.toString().replace('http://identifiers.org/combine.specifications/', '').replace('http://identifiers.org/edam/', '')

        this.attachmentHash = attachment.hash

        this.attachmentName = 'Attachment'
        if (attachment.source.toString().startsWith(config.get('databasePrefix'))) {
            this.attachmentDownloadURL = '/' + attachment.source.toString().replace(config.get('databasePrefix'), '')
            if (attachment.source.toString().startsWith(config.get('databasePrefix') + 'user/') && req.url.toString().endsWith('/share')) {
                this.attachmentDownloadURL = this.attachmentDownloadURL.replace('/download', '') + '/' + sha1('synbiohub_' + sha1(attachment.source.toString().replace('/download', '')) + config.get('shareLinkSalt')) + '/share/download'
            }
        } else {
            this.attachmentDownloadURL = attachment.source
        }

        this.size = attachment.size.toString()


        this.attachmentIsImage = attachment.format.toString().indexOf("png") >= 0
            || attachment.format.toString() == "http://identifiers.org/edam/format_3603"
            || attachment.format.toString().indexOf("imageAttachment") >= 0;
    }

    async render(res:Response) {

        res.render('templates/views/attachment.jade', this)

    }
}


