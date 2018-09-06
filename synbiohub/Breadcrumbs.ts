
import { Request } from 'express'
import SBHURI from 'synbiohub/SBHURI';
import { SBOL2Graph, S2Identified } from 'sbolgraph';
import Datastores from 'synbiohub/datastore/Datastores';

export default class Breadcrumbs {

    crumbs:Array<Breadcrumb>

    constructor(crumbs:Array<Breadcrumb>) {

        this.crumbs = crumbs

    }

    static async fromTopLevelURI(req:Request, uri:SBHURI):Promise<Breadcrumbs> {

        let datastore = Datastores.forSBHURI(uri)

        let graph:SBOL2Graph = new SBOL2Graph()
        let identified:S2Identified = new S2Identified(graph, uri.toURI())

        let p_metadata = datastore.fetchMetadata(graph, identified)
        let p_collections = datastore.fetchContainingCollectionMetadata(graph, identified)

        await p_metadata
        await p_collections

        let crumb = new Breadcrumb(uri.toURL(), identified.displayName)

        let collections = identified.containingCollections

        if(collections.length > 0) {

            // TODO: get collection with most? members rather than just first one returned

            let otherCrumbs = await Breadcrumbs.fromTopLevelURI(req, collections[0].uri)
            
            return otherCrumbs.join(new Breadcrumbs([ crumb ]))

        } else {

            return new Breadcrumbs([ crumb ])

        }
    }

    join(other:Breadcrumbs) {

        return new Breadcrumbs(this.crumbs.concat(other.crumbs))

    }



}

export class Breadcrumb {

    uri:string
    title:string

    constructor(uri:string, title:string) {
        this.uri = uri
        this.title = title
    }

}


