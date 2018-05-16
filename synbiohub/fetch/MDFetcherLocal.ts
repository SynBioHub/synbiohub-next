
import MDFetcher from "./MDFetcher";

import escape = require('pg-escape')
import loadTemplate from "synbiohub/loadTemplate";
import * as sparql from 'synbiohub/sparql/sparql'
import config from "synbiohub/config";
import compareMavenVersions from "synbiohub/compareMavenVersions";

export default class MDFetcherLocal extends MDFetcher {

    private graphUri:string

    constructor(graphUri:string) {

        super()

        this.graphUri = graphUri

    }

    async getOwnedBy(uri: string): Promise<string> {

        let query = loadTemplate('./sparql/GetOwnedBy.sparql', {
            topLevel: uri
        })

        let results = await sparql.queryJson(query, this.graphUri)

        return results.map((result) => result.ownedBy)
    }

    async getCollectionMemberCount(uri:string, search?:string):Promise<number> {

        const isSearch = (search !== '')

        var templateParams =  {
            collection: uri,
            search: search ? escape(
                    'FILTER(CONTAINS(lcase(?displayId), lcase(%L))||CONTAINS(lcase(?name), lcase(%L))||CONTAINS(lcase(?description), lcase(%L)))',
                    search, search, search
                ) : ''
        }

        var query = isSearch?
            loadTemplate('./sparql/CountMembersSearch.sparql', templateParams)
            : loadTemplate('./sparql/CountMembers.sparql', templateParams)

        console.log(query)

        let result = await sparql.queryJson(query, this.graphUri)

        if (result && result[0]) {
            console.log(result)

            return result[0].count

        } else {

            throw new Error('collection not found')

        }
    }

    async getRootCollectionMetadata():Promise<Array<any>> {

        var query = loadTemplate('./sparql/RootCollectionMetadata.sparql', {});

        let sparqlResults = await sparql.queryJson(query, this.graphUri)

        return sparqlResults.map(function (result) {
            return {
                uri: result['Collection'],
                name: result['name'] || '',
                description: result['description'] || '',
                displayId: result['displayId'] || '',
                version: result['version'] || ''
            };
        })
    }

    async getContainingCollections(uri):Promise<Array<any>> {

        function sortByNames(a, b) {
            if (a.name < b.name) {
                return -1
            } else {
                return 1
            }
        }

        var query =
            'PREFIX sbol2: <http://sbols.org/v2#>\n' +
            'PREFIX dcterms: <http://purl.org/dc/terms/>\n' +
            'SELECT ?subject ?displayId ?title WHERE {' +
            '   ?subject a sbol2:Collection .' +
            '   ?subject sbol2:member <' + uri + '> .' +
            '   OPTIONAL { ?subject sbol2:displayId ?displayId } .' +
            '   OPTIONAL { ?subject dcterms:title ?title } .' +
            '}'

        let results = await sparql.queryJson(query, this.graphUri)

        results = results.map((result) => {
            return {
                uri: result.subject,
                name: result.title ? result.title : result.displayId
            }
        })

        results.sort(sortByNames)
        
        return results
    }

    async getCollectionMembers(uri, limit, offset, sortColumn, search):Promise<Array<any>> {

        var graphs = ''
        var sort = ''
        if (this.graphUri) {
            graphs = 'FROM <' + config.get('triplestore').defaultGraph + '> FROM <' + this.graphUri + '>'
        }

        const isSearch = (search !== '')

        sort = ' ORDER BY ASC(lcase(str(?type))) ASC(str(lcase(?name))) '

        //sort = ' ORDER BY ASC(lcase(str(?type))) ASC(concat(str(lcase(?name)),str(lcase(?displayId)))) '

        if (sortColumn !== undefined && 
        sortColumn.dir !== undefined &&
        sortColumn.column !== undefined) {
        if (sortColumn.column == 'name') {
            sort = ' ORDER BY ' + sortColumn.dir.toUpperCase() + 
            '(lcase(str(?name))) '
    //		'(concat(str(lcase(?name)),str(lcase(?displayId)))) '
        } else if (sortColumn.column == 'type') {
            sort = ' ORDER BY ' + sortColumn.dir.toUpperCase() + '(lcase(str(?type))) ' +
            'ASC(lcase(str(?name))) '
    //		'ASC(concat(str(lcase(?name)),str(lcase(?displayId)))) '
        } else {
            sort = ' ORDER BY ' + sortColumn.dir.toUpperCase() + '(lcase(str(?' + sortColumn.column + '))) '
        }
        }

        var templateParams = {
            graphs: graphs,
            collection: uri,
            offset: offset !== undefined ? ' OFFSET ' + offset : '',
            limit: limit !== undefined ? ' LIMIT ' + limit : '',
        //sort: sortColumn !== undefined && sortColumn.dir !== undefined && sortColumn.column !== undefined ? ' ORDER BY ' + sortColumn.dir.toUpperCase() + '(UCASE(str(?' + sortColumn.column + '))) ' : '',
            sort: sort,
            search: search !== '' && search !== undefined ? escape(
                    'FILTER(CONTAINS(lcase(?displayId), lcase(%L))||CONTAINS(lcase(?name), lcase(%L))||CONTAINS(lcase(?description), lcase(%L)))',
                    search, search, search
                ) : ''
        }

        var query = isSearch?loadTemplate('sparql/getCollectionMembersSearch.sparql', templateParams):
        loadTemplate('sparql/getCollectionMembers.sparql', templateParams)

        console.log(query)

        let result = await sparql.queryJson(query, this.graphUri)

        if (result) {

            return result

        } else {

            throw new Error('collection not found')

        }
    }

    async getSubCollections(uri):Promise<Array<any>> {

        var query = loadTemplate('./sparql/SubCollectionMetadata.sparql', {

            parentCollection: sparql.escapeIRI(uri)

        })

        let sparqlResults = await sparql.queryJson(query, this.graphUri)

        return sparqlResults.map(function (result) {
            return {
                uri: result['Collection'],
                name: result['name'] || '',
                description: result['description'] || '',
                displayId: result['displayId'] || '',
                version: result['version'] || ''
            };
        });
    }

    async getCollectionMetadata(uri) {

        var templateParams = {
            collection: uri
        }

        var query = loadTemplate('sparql/getCollectionMetaData.sparql', templateParams)

        let result = await sparql.queryJson(query, this.graphUri)

        if (result && result[0]) {

            return result[0]

        } else {

            return null /* not found */

        }
    }

    async getComponentDefinitionMetadata(uri) {

        var templateParams = {
            componentDefinition: uri
        }

        var query = loadTemplate('sparql/getComponentDefinitionMetaData.sparql', templateParams)

        let result = await sparql.queryJson(query, this.graphUri)

        if (result && result[0]) {

            return {
                metaData: result[0],
                graphUri: this.graphUri
            }

        } else {

            return null

        }

    }

    async getCount(type) {

        var query = loadTemplate('./sparql/Count.sparql', {
            type: type
        })

        let result = await sparql.queryJson(query, this.graphUri)

        if (result && result[0]) {

            return parseInt(result[0].count)

        } else {

            throw new Error('not found')

        }
    }

    async getModuleDefinitionMetadata(uri) {

        var templateParams = {
            moduleDefinition: uri
        }

        var query = loadTemplate('sparql/getModuleDefinitionMetaData.sparql', templateParams)

        let result = await sparql.queryJson(query, this.graphUri)

        if (result && result[0]) {

            return result[0]

        }
    }

    async getName(uri) {

        var query = loadTemplate('./sparql/GetName.sparql', {
            uri: uri
        })

        let result = await sparql.queryJson(query, this.graphUri)

        if (result && result[0]) {

            return result[0].name

        } else {

            throw new Error('getName: ' + uri + ' not found')

        }
    }

    async getType(uri) {

        let result = await sparql.queryJson('SELECT ?type WHERE { <' + uri + '> a ?type }', this.graphUri)

        if (result && result[0]) {

            return result[0].type

        } else {

            throw new Error('getType: ' + uri + ' not found')

        }
    }

    async getVersion(uri) {

        var query = loadTemplate('./sparql/GetVersions.sparql', {
            uri: uri
        })

        let results = await sparql.queryJson(query, this.graphUri)

        if(results && results[0]) {

            const sortedVersions = results.sort((a, b) => {

                return compareMavenVersions(a.version, b.version)

            }).reverse()

            return sortedVersions[0].version

        } else {

            throw new Error('not found')

        }
    }



}
