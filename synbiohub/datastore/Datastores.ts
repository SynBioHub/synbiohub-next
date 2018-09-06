import DatastoreSPARQL from "./DatastoreSPARQL";
import config from 'synbiohub/config'
import SBHURI from "../SBHURI";

export default class Datastores {

    static forUser(user:any) {
        return new DatastoreSPARQL({
            endpointURL: config.get('triplestore').sparqlEndpoint,
            graphURI: config.get('databasePrefix') + 'user/' + user.username
        })
    }

    static public(user:any) {
        return new DatastoreSPARQL({
            endpointURL: config.get('triplestore').sparqlEndpoint,
            graphURI: config.get('triplestore').defaultGraph
        })
    }

    static forSBHURI(uri:SBHURI) {

        console.log('*********************** forSBHURI ' + uri.toURI())
        console.log('******** GURI is ' + uri.getGraph())

        return new DatastoreSPARQL({
            endpointURL: config.get('triplestore').sparqlEndpoint,
            graphURI: uri.getGraph()
        })
    }

}
