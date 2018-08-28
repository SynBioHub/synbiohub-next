
import { SBHRequest } from "synbiohub/SBHRequest";
import View from "synbiohub/views/View";
import { Response } from 'express'
import MDFetcherLocal from "../fetch/MDFetcherLocal";
import uriToUrl from "synbiohub/uriToUrl";

interface Project {
    url:string
    name:string
}

export default class ViewIndex extends View {

    recentProjects:Array<Project>

    constructor() {

        super()

        this.recentProjects = []
    }

    async prepare(req:SBHRequest) {

        await super.prepare(req)

        if(req.user) {

            let collections = await (new MDFetcherLocal(req.user.graphUri)).getRootCollectionMetadata()

            for(let collection of collections) {

                this.recentProjects.push({
                    url: uriToUrl(collection.uri, req),
                    name: collection.name
                })
            }

        }

    }

    async render(res:Response) {

        res.render('templates/views/index.jade', this)

    }
}

