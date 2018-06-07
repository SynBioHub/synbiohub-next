
import View from "synbiohub/views/View";
import getUrisFromReq, { ReqURIInfo } from "../getUrisFromReq";
import wiky from "synbiohub/wiky/wiky";
import shareImages from "synbiohub/shareImages";
import config from 'synbiohub/config'
import sha1 = require('sha1')
import { SBHRequest } from "synbiohub/SBHRequest";
import Menu, { MenuItem } from "../Menu";

export default abstract class ViewTopLevel extends View {

    uriInfo:ReqURIInfo

    topLevelDownloadMenu:Menu
    topLevelShareMenu:Menu
    topLevelOtherMenu:Menu

    constructor() {

        super()
    }

    async prepare(req:SBHRequest) {

        await super.prepare(req)

        this.uriInfo = getUrisFromReq(req)

    }


    rdfType:any


    // TODO get rid of this
    meta:any
     
    protected setTopLevelMetadata(req:SBHRequest, meta:any) {
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

        this.buildTopLevelMenus()
    }

    private buildTopLevelMenus() {

        let id = this.meta.id

        this.topLevelDownloadMenu = new Menu()
        this.topLevelDownloadMenu.addItem(new MenuItem('Download SBOL', this.uriInfo.url + '/' + id + '.xml', 'fa-download'))
        this.topLevelDownloadMenu.addItem(new MenuItem('Download COMBINE archive', this.uriInfo.url + '/' + id + '.omex', 'fa-download'))
        this.topLevelDownloadMenu.addItem(new MenuItem('Download GenBank', this.uriInfo.url + '/' + id + '.gb', 'fa-download'))
        this.topLevelDownloadMenu.addItem(new MenuItem('Download FASTA', this.uriInfo.url + '/' + id + '.fasta', 'fa-download'))
        this.topLevelDownloadMenu.addItem(new MenuItem('Download Image', '/sbol', 'fa-image'))

        this.topLevelShareMenu = new Menu()
        this.topLevelShareMenu.addItem(new MenuItem('Get Share Link', '/sbol', 'fa-link'))
        this.topLevelShareMenu.addItem(new MenuItem('Send to Benchling', this.uriInfo + '/' + id + '/createBenchlingSequence', 'fa-external-link-alt'))
        this.topLevelShareMenu.addItem(new MenuItem('Send to ICE', this.uriInfo + '/' + id + '/createICEPart', 'fa-external-link-alt'))
        this.topLevelShareMenu.addItem(new MenuItem('Add Owner', '/sbol', 'fa-users'))
        this.topLevelShareMenu.addItem(new MenuItem('Make Public', '/sbol', 'fa-globe'))

        this.topLevelOtherMenu = new Menu()
        this.topLevelOtherMenu.addItem(new MenuItem('Find Uses', this.uriInfo + '/' + id + '/uses', 'fa-search'))
        this.topLevelOtherMenu.addItem(new MenuItem('Find Matching Parts', this.uriInfo + '/' + id + '/twins', 'fa-search'))
        this.topLevelOtherMenu.addItem(new MenuItem('Delete Part', this.uriInfo.uri + '/remove', 'fa-trash-alt'))

    }

     



}
