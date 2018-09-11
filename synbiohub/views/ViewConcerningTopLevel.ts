import SBHURI from "synbiohub/SBHURI";
import { SBHRequest } from "synbiohub/SBHRequest";
import View from "synbiohub/views/View";
import { Response } from 'express'
import Datastore from "synbiohub/datastore/Datastore";
import DatastoreSPARQL from "synbiohub/datastore/DatastoreSPARQL";
import Datastores from "../datastore/Datastores";
import { SBOL2Graph, S2Identified } from "sbolgraph";

export default class ViewConcerningTopLevel extends View {

    constructor() {
        super()
    }

    uri:SBHURI
    datastore:Datastore
    graph:SBOL2Graph
    object:S2Identified

    async prepare(req:SBHRequest) {

        this.uri = SBHURI.fromURIOrURL(req.url)
        this.datastore = Datastores.forSBHURI(this.uri)
        this.graph = new SBOL2Graph()

        await this.datastore.fetchMetadata(this.graph, new S2Identified(this.graph, this.uri.toURI()))

        this.object = this.graph.uriToFacade(this.uri.toURI())

    }

    async render(res:Response) {
        throw new Error("Method not implemented.");
    }
}

