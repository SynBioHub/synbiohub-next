
import { SBHRequest } from "synbiohub/SBHRequest";
import View from "synbiohub/views/View";
import { Response } from 'express'
import SBHURI from "../SBHURI";
import Datastores from "../datastore/Datastores";
import { SBOL2Graph } from "sbolgraph";
import Datastore from "synbiohub/datastore/Datastore";

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

            let userDatastore:Datastore = Datastores.forUser(req.user)
            let graph:SBOL2Graph = new SBOL2Graph()

            await userDatastore.fetchRootCollectionMetadata(graph)

            for(let collection of graph.collections) {

                this.recentProjects.push({
                    url: SBHURI.fromURIOrURL(collection.uri).toURL(),
                    name: collection.name
                })
            }

        }

    }

    async render(res:Response) {

        res.render('templates/views/index.jade', this)

    }
}

