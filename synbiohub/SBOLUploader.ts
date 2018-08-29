import { SBOL2Graph } from "sbolgraph";
import * as sparql from 'synbiohub/sparql/sparql'
import OverwriteMerge, { OverwriteMergeOption } from "./OverwriteMerge";

class BehaviorOnExisting {
}


export default class SBOLUploader {

    private graph:SBOL2Graph
    private graphUri:string|null
    private overwriteMerge:OverwriteMerge

    constructor() {
        this.graphUri = null
        this.overwriteMerge = OverwriteMergeOption.FailIfExists
    }

    // Set the URI of the triplestore graph to upload to
    // null = the public triplestore
    //
    setDestinationGraphUri(graphUri:string|null) {
        this.graphUri = graphUri
    }


    setGraph(graph:SBOL2Graph) {
        this.graph = graph
    }

    setOverwriteMerge(overwriteMerge:OverwriteMerge) {
        this.overwriteMerge = overwriteMerge
    }

    async upload() {

        // TODO handle overwrite/merge

        if(!this.graph) {
            throw new Error('No graph given to upload')
        }

        let rdfxml = await this.graph.serializeXML()

        await sparql.upload(this.graphUri, rdfxml, 'application/rdf+xml')
    }

}
