
import { Request } from 'express'
import DefaultMDFetcher from './fetch/DefaultMDFetcher';
import SBHURI from 'synbiohub/SBHURI';

export default class Breadcrumbs {

    crumbs:Array<Breadcrumb>

    constructor(crumbs:Array<Breadcrumb>) {

        this.crumbs = crumbs

    }

    // TODO: separate requests from this kind of function
    //
    static async fromTopLevelObject(req:Request, object:any):Promise<Breadcrumbs> {

        let crumb = new Breadcrumb(object.uri.toString(), object.name)

        let collections:any = await DefaultMDFetcher.get(req).getContainingCollections(object.uri.toString())

        if(collections.length > 0) {

            // TODO: get collection with most? members rather than just first one returned

            let otherCrumbs = await Breadcrumbs.fromTopLevelURI(req, collections[0].uri)
            
            return otherCrumbs.join(new Breadcrumbs([ crumb ]))

        } else {

            return new Breadcrumbs([ crumb ])

        }
    }


    static async fromTopLevelURI(req:Request, uri:SBHURI):Promise<Breadcrumbs> {

        let name = await DefaultMDFetcher.get(req).getName(uri)

        let crumb = new Breadcrumb(uri.toURL(), name)

        let collections:any = await DefaultMDFetcher.get(req).getContainingCollections(uri)

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


