
import { SBHRequest } from "synbiohub/SBHRequest";
import View from "synbiohub/views/View";
import { Response } from 'express'
import config from 'synbiohub/config'
import DefaultMDFetcher from "synbiohub/fetch/DefaultMDFetcher";
import uriToUrl from "synbiohub/uriToUrl";
import sha1 = require('sha1')

export default class ViewBrowse extends View {

    collections:any[]

    constructor() {
        super()
    }

    async prepare(req:SBHRequest) {

        await super.prepare(req)


        let collections = await DefaultMDFetcher.get(req).getRootCollectionMetadata()

        const collectionIcons = config.get('collectionIcons');

        for (let collection of collections) {

            console.log(config.get('databasePrefix') + collection.uri);

            collection.url = uriToUrl(collection.uri);

            if (req.url.endsWith('/share')) {
                collection.url += '/' + sha1('synbiohub_' + sha1(collection.uri) + config.get('shareLinkSalt')) + '/share';
            };

            collection.icon = collectionIcons[collection.uri];

            const remoteConfig = config.get('remotes')[collection.displayId.replace('_collection', '')]
            if (!remoteConfig || (remoteConfig && remoteConfig.public && collection.version === 'current')) {
                collection.public = true
            } else {
                collection.public = false
            }

        }

        this.collections = collections

        this.title = 'Browse Parts and Designs ‒ ' + config.get('instanceName')
        this.metaDesc = 'Browse ' + collections.length + ' collection(s) including ' + collections.map((collection) => collection.name).join(', ')
    }

    async render(res:Response) {

        res.render('templates/views/browse.jade', this)

    }
}

