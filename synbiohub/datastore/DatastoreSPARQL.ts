
import Datastore from "./Datastore";
import { SBOL2Graph, S2Collection, S2Identified } from 'sbolgraph'
import request = require('request-promise')
import DatastoreSearchQuery, { SortDirection } from "./DatastoreSearchQuery";

export interface SPARQLConfig {
    endpointURL:string
    graphURI:string
}

export default class DatastoreSPARQL extends Datastore {

    sparqlConfig:SPARQLConfig

    constructor(sparqlConfig:SPARQLConfig) {

        super()

        this.sparqlConfig = sparqlConfig
    }

    supportsSPARQL():boolean {
        return true
    }

    async sparqlConstruct(intoGraph:SBOL2Graph, query:string) {

        // console.log('GUIIIII ' + this.sparqlConfig.graphURI)

        // console.log('>>>>>>>>>>>>>>>>>>>> QUERY')
        // console.log(query)
        // console.log('<<<<<<<<<<<<<<<<<<<<<<<<<<<<<')

        let result = await request({
            method: 'get',
            url: this.sparqlConfig.endpointURL,
            qs: {
                query: query,
                'default-graph-uri': this.sparqlConfig.graphURI
            }
        })

        // console.log('>>>>>>>>>>>>>>>>>>>> LOAD')
        // console.log(result)
        // console.log('<<<<<<<<<<<<<<<<<<<<<<<<<<<<<')

        await intoGraph.loadString(result)
    }

    async fetchMetadata(intoGraph:SBOL2Graph, identified:S2Identified) {

        await this.sparqlConstruct(intoGraph, `
            PREFIX sbol: <http://sbols.org/v2#>
            PREFIX dcterms: <http://purl.org/dc/terms/>
            PREFIX sbh: <http://wiki.synbiohub.org/wiki/Terms/synbiohub#>
            CONSTRUCT {
                <${identified.uri}> a ?type .
                <${identified.uri}> sbol:displayId ?displayId .
                <${identified.uri}> dcterms:title ?title .
                <${identified.uri}> dcterms:description ?desc .
                <${identified.uri}> sbh:ownedBy ?ownedBy .
            } WHERE {
                <${identified.uri}> a ?type .
                <${identified.uri}> sbol:displayId ?displayId .
                OPTIONAL { <${identified.uri}> dcterms:title ?title . }
                OPTIONAL { <${identified.uri}> dcterms:description ?desc . }
                OPTIONAL { <${identified.uri}> sbh:ownedBy ?ownedBy . }
            } LIMIT 100
        `)

    }

    async fetchEverything(intoGraph:SBOL2Graph, identified:S2Identified) {
        await this.sparqlConstruct(intoGraph, `
            PREFIX sbol: <http://sbols.org/v2#>
            PREFIX dcterms: <http://purl.org/dc/terms/>
            PREFIX sbh: <http://wiki.synbiohub.org/wiki/Terms/synbiohub#>
            CONSTRUCT {
                <${identified.uri}> ?p ?o .
            } WHERE {
                <${identified.uri}> ?p ?o .
            } LIMIT 1000
        `)
    }

    async fetchRootCollectionMetadata(intoGraph:SBOL2Graph) {

        await this.sparqlConstruct(intoGraph, `
            PREFIX sbol: <http://sbols.org/v2#>
            PREFIX dcterms: <http://purl.org/dc/terms/>
            PREFIX sbh: <http://wiki.synbiohub.org/wiki/Terms/synbiohub#>
            CONSTRUCT {
                ?s a sbol:Collection .
                ?s sbol:displayId ?displayId .
                ?s dcterms:title ?title .
                ?s dcterms:description ?description .
                ?s sbh:ownedBy ?ownedBy .
            } WHERE {
                ?s a sbol:Collection .
                ?s sbol:displayId ?displayId .
                FILTER NOT EXISTS { ?other sbol:member ?s }
                OPTIONAL { ?s dcterms:title ?title . }
                OPTIONAL { ?s dcterms:description ?description . }
                OPTIONAL { ?s sbh:ownedBy ?ownedBy . }
            } LIMIT 100
        `)


    }

    async countMembers(collection:S2Collection):Promise<number> {

        let res = await this.sparqlSelect(`
            PREFIX sbol: <http://sbols.org/v2#>
            PREFIX dcterms: <http://purl.org/dc/terms/>
            SELECT COUNT(?member) as ?count WHERE {
                <${collection.uri}> sbol:member ?member .
            }
        `)

        return parseInt(res[0].count)
    }

    async fetchMembersMetadata(intoGraph:SBOL2Graph, collection:S2Collection, searchQuery?:DatastoreSearchQuery) {

        await this.sparqlConstruct(intoGraph, `
            PREFIX sbol: <http://sbols.org/v2#>
            PREFIX dcterms: <http://purl.org/dc/terms/>
            PREFIX sbh: <http://wiki.synbiohub.org/wiki/Terms/synbiohub#>
            CONSTRUCT {
                <${collection.uri}> sbol:member ?s .
                ?s a ?type .
                ?s sbol:displayId ?displayId .
                ?s dcterms:title ?title .
                ?s dcterms:description ?description .
                ?s sbh:ownedBy ?ownedBy .
                ?s sbol:role ?role .
                ?s sbol:encoding ?encoding .
            } WHERE {
                <${collection.uri}> sbol:member ?s .
                ?s a ?type .
                ?s sbol:displayId ?displayId .
                OPTIONAL { ?s dcterms:title ?title . }
                OPTIONAL { ?s dcterms:description ?description . }
                OPTIONAL { ?s sbh:ownedBy ?ownedBy . }
                OPTIONAL { ?s sbol:role ?role . }
                OPTIONAL { ?s sbol:encoding ?encoding . }
                ${searchQuery ? this.sparqlFilterFromSearchQuery('?s', searchQuery) : ''}
                ${searchQuery ? this.sparqlBindOrderPredicateFromSearchQuery('?s', searchQuery) : ''}
            } LIMIT 100
        `)
    }

    private sparqlBindOrderPredicateFromSearchQuery(subject:string, searchQuery:DatastoreSearchQuery):string {

        if(searchQuery.sortByPredicate) {
            return `${subject} <${searchQuery.sortByPredicate}> ?sortBy .`
        } else {
            return ''
        }
    }

    private sparqlFilterFromSearchQuery(subject:string, searchQuery:DatastoreSearchQuery):string {

        let substr = searchQuery.substring

        if(substr) {
            return `FILTER(
                CONTAINS(lcase(str(${subject})), lcase(${substr})) ||
                CONTAINS(lcase(?displayId), lcase(${substr})) ||
                CONTAINS(lcase(?title), lcase(${substr})) ||
                CONTAINS(lcase(?description), lcase(${substr}))
            )`
        } else {
            return ''
        }
    }

    private sparqlOrderFromSearchQuery(searchQuery:DatastoreSearchQuery):string {

        if(searchQuery.sortByPredicate) {
            let order = searchQuery.sortDirection === SortDirection.Ascending ? 'ASC' : 'DESC'
            return `ORDER BY ${order}(lcase(str(?sortBy)))`
        } else {
            return ''
        }
    }
    
    async fetchContainingCollectionMetadata(intoGraph:SBOL2Graph, identified:S2Identified) {

        await this.sparqlConstruct(intoGraph, `
            PREFIX sbol: <http://sbols.org/v2#>
            PREFIX dcterms: <http://purl.org/dc/terms/>
            PREFIX sbh: <http://wiki.synbiohub.org/wiki/Terms/synbiohub#>
            CONSTRUCT {
                ?s sbol:member <${identified.uri}>  .
                ?s a ?type .
                ?s sbol:displayId ?displayId .
                ?s dcterms:title ?title .
                ?s dcterms:description ?description .
                ?s sbh:ownedBy ?ownedBy .
            } WHERE {
                ?s sbol:member <${identified.uri}>  .
                ?s a ?type .
                ?s sbol:displayId ?displayId .
                OPTIONAL { ?s dcterms:title ?title . }
                OPTIONAL { ?s dcterms:description ?description . }
                OPTIONAL { ?s sbh:ownedBy ?ownedBy . }
            } LIMIT 100
        `)

    }


}

