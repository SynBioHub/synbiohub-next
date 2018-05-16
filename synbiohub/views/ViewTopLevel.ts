
import View from "synbiohub/views/View";
import getUrisFromReq, { ReqURIInfo } from "../getUrisFromReq";
import wiky from "synbiohub/wiky/wiky";
import shareImages from "synbiohub/shareImages";
import config from 'synbiohub/config'
import sha1 = require('sha1')

export default abstract class ViewTopLevel extends View {

    uriInfo:ReqURIInfo

    constructor() {

        super()

    }

    async prepare(req:Request) {

        await super.prepare(req)

        this.uriInfo = getUrisFromReq(req)

    }


    rdfType:any


    // TODO get rid of this
    meta:any
     
    protected setTopLevelMetadata(req:Request, meta:any) {
        if (meta.description != '') {
            meta.description = wiky.process(meta.description, {})
        }

        meta.mutableDescriptionSource = meta.mutableDescription.toString() || ''
        if (meta.mutableDescription.toString() != '') {
            meta.mutableDescription = shareImages(req, meta.mutableDescription.toString())
            meta.mutableDescription = wiky.process(meta.mutableDescription.toString(), {})
        }

        meta.mutableNotesSource = meta.mutableNotes.toString() || ''
        if (meta.mutableNotes.toString() != '') {
            meta.mutableNotes = shareImages(req, meta.mutableNotes.toString())
            meta.mutableNotes = wiky.process(meta.mutableNotes.toString(), {})
        }

        meta.sourceSource = meta.source.toString() || ''
        if (meta.source.toString() != '') {
            meta.source = shareImages(req, meta.source.toString())
            meta.source = wiky.process(meta.source.toString(), {})
        }

        meta.url = '/' + meta.uri.toString().replace(config.get('databasePrefix'), '')

        if (req.url.toString().endsWith('/share')) {
            meta.url += '/' + sha1('synbiohub_' + sha1(meta.uri) + config.get('shareLinkSalt')) + '/share'
        }

        if (meta.isReplacedBy && meta.isReplacedBy.uri != '') {
            meta.isReplacedBy.uri = '/' + meta.isReplacedBy.uri.toString().replace(config.get('databasePrefix'), '')
            meta.isReplacedBy.id = meta.isReplacedBy.uri.toString().replace('/public/', '').replace('/1', '') + ' '
            meta.isReplacedBy.id = meta.isReplacedBy.id.substring(meta.isReplacedBy.id.indexOf('/') + 1)
        }

        this.meta = meta
    }
     



}
