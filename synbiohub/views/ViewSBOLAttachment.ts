
import sbolmeta from 'sbolmeta';
import ViewTopLevelWithObject from 'synbiohub/views/ViewTopLevelWithObject';

import { Request, Response } from 'express'
import config from 'synbiohub/config';

import sha1 from 'sha1'

export default class ViewSBOLAttachment extends ViewTopLevelWithObject {

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

    async prepare(req: Request) {

        await super.prepare(req)

        this.setTopLevelMetadata(req, sbolmeta.summarizeGenericTopLevel(this.object))


        let attachment = this.object

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

        this.size = attachment.size


        this.attachmentIsImage = attachment.format.toString().indexOf("png") >= 0
            || attachment.format.toString() == "http://identifiers.org/edam/format_3603"
            || attachment.format.toString().indexOf("imageAttachment") >= 0;
    }

    async render(res:Response) {

        res.render('templates/views/attachment.jade', this)

    }
}


