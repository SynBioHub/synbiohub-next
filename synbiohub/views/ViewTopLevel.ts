
import View from "synbiohub/views/View";
import wiky from "synbiohub/wiky/wiky";
import shareImages from "synbiohub/shareImages";
import config from 'synbiohub/config'
import sha1 = require('sha1')
import { SBHRequest } from "synbiohub/SBHRequest";
import Menu, { MenuItem } from "../Menu";
import SBHURI from "synbiohub/SBHURI";

export default abstract class ViewTopLevel extends View {

    uri:SBHURI

    topLevelDownloadMenu:Menu
    topLevelShareMenu:Menu
    topLevelOtherMenu:Menu

    constructor() {

        super()
    }

    async prepare(req:SBHRequest) {

        await super.prepare(req)

        this.uri = SBHURI.fromURIOrURL(req.url)
    }


    rdfType:any


    protected buildTopLevelMenus(id:string) {

        let url = this.uri.toURL()

        this.topLevelDownloadMenu = new Menu()
        this.topLevelDownloadMenu.addItem(new MenuItem('Download SBOL', url + '/' + id + '.xml', 'fa-download'))
        this.topLevelDownloadMenu.addItem(new MenuItem('Download COMBINE archive', url + '/' + id + '.omex', 'fa-download'))
        this.topLevelDownloadMenu.addItem(new MenuItem('Download GenBank', url + '/' + id + '.gb', 'fa-download'))
        this.topLevelDownloadMenu.addItem(new MenuItem('Download FASTA', url + '/' + id + '.fasta', 'fa-download'))
        this.topLevelDownloadMenu.addItem(new MenuItem('Download Image', '/sbol', 'fa-image'))

        this.topLevelShareMenu = new Menu()
        this.topLevelShareMenu.addItem(new MenuItem('Get Share Link', '/sbol', 'fa-link'))
        this.topLevelShareMenu.addItem(new MenuItem('Send to ICE', url + '/' + id + '/createICEPart', 'fa-external-link-alt'))
        this.topLevelShareMenu.addItem(new MenuItem('Add Owner', '/sbol', 'fa-users'))
        this.topLevelShareMenu.addItem(new MenuItem('Make Public', '/sbol', 'fa-globe'))

        this.topLevelOtherMenu = new Menu()
        this.topLevelOtherMenu.addItem(new MenuItem('Find Uses', url + '/' + id + '/uses', 'fa-search'))
        this.topLevelOtherMenu.addItem(new MenuItem('Find Matching Parts', url + '/' + id + '/twins', 'fa-search'))
        this.topLevelOtherMenu.addItem(new MenuItem('Delete Part', url + '/remove', 'fa-trash-alt'))

    }

     



}
