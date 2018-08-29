
var pug = require('pug')

var async = require('async')

import * as search from 'synbiohub/search'

var extend = require('xtend')

var escape = require('pg-escape')
    
var igemNS = 'http://wiki.synbiohub.org/wiki/Terms/igem#'

var biopaxNS = 'http://www.biopax.org/release/biopax-level3.owl#'

var soNS = 'http://identifiers.org/so/'

import config from 'synbiohub/config'

var collNS = config.get('databasePrefix') + 'public/'

import * as sparql from 'synbiohub/sparql/sparql'

import serializeSBOL from 'synbiohub/serializeSBOL'
import View from 'synbiohub/views/View';
import { SBHRequest } from 'synbiohub/SBHRequest';

import { Response } from 'express'


enum SearchMode {
    AdvancedSearchForm,
    CreateCollectionForm,
    CreateCollectionPost,
    Results
}

export default class ViewAdvancedSearch extends View {

    searchMode:SearchMode

    lists:any

    /// for the form
    collectionMeta: any
    objectTypes: any[]
    creators: any[]
    partStatuses: any[]
    sampleStatuses: any[]
    statuses: any[]
    experiences: any[]
    types: any[]
    roles: any[]
    igemRoles: any[]
    collections: any[]

    /// for the results page (uses search template for some reason)
    results:any[]
    firstResultNum:number
    lastResultNum:number
    numResultsTotal:number
    limit:number
    searchQuery:string


    constructor() {

        super()

    }

    async prepare(req:SBHRequest) {

        await super.prepare(req)

        this.lists = await getUriList(null)

        if(req.method === 'GET') {

            this.collectionMeta = { id: '', version: '', name: '', description: '' }
            this.objectTypes =  [{ name: 'Collection' }, { name: 'ComponentDefinition' }, { name: 'Model' }, { name: 'ModuleDefinition' }, { name: 'Sequence' }]
            this.creators = this.lists.creatorList,
            this.partStatuses = this.lists.partStatusList,
            this.sampleStatuses = this.lists.sampleStatusList,
            this.statuses = this.lists.statusList,
            this.experiences = this.lists.experienceList,
            this.types = this.lists.typeList,
            this.roles = this.lists.roleList,
            this.igemRoles = this.lists.igemRoleList,
            this.collections = this.lists.collectionList

            if (req.originalUrl.endsWith('/createCollection')) {
                this.searchMode = SearchMode.CreateCollectionForm
            } else {
                this.searchMode = SearchMode.AdvancedSearchForm
            }

        } else {

            await this.performSearch(req)

            if (req.originalUrl.endsWith('/createCollection')) {
                this.searchMode = SearchMode.CreateCollectionPost
            } else {
                this.searchMode = SearchMode.Results
            }

        }
    }

    async render(res:Response) {

        switch(this.searchMode) {

            case SearchMode.CreateCollectionForm:
                res.render('templates/views/createCollection.jade', this)
                break

            case SearchMode.CreateCollectionPost:
                res.redirect('/manage')
                break

            case SearchMode.AdvancedSearchForm:
                res.render('templates/views/advanced-search.jade', this)
                break

            case SearchMode.Results:
                res.render('templates/views/search.jade', this)
                break
        }

    }

    private async performSearch(req:SBHRequest) {

        var limit = 50

        var criteriaStr = ''
        var criteria = []

        var mappedCreators = {};
        var query = '';
        if(req.body.objectType!=='Any Object Type') {
            criteriaStr += '   ?subject a sbol2:' + req.body.objectType + ' . '
            query += 'objectType='+req.body.objectType+'&'
        }
        for (var i = 0; i < this.lists.creatorList.length; i++) {
            mappedCreators[this.lists.creatorList[i].name] = this.lists.creatorList[i];
        } 
        if(req.body.creator!=='Any Creator') {
            criteriaStr += '   ?subject dc:creator \'' + mappedCreators[req.body.creator].uri + '\' . '
            query += 'dc:creator=\''+mappedCreators[req.body.creator].uri+'\'&'
        }
        if(req.body.createdAfter!=='' || req.body.createdBefore!=='') {
            criteriaStr += '   ?subject dcterms:created ?cdate . '
        }
        if(req.body.createdAfter!=='') {
            criteriaStr += '   FILTER (xsd:dateTime(?cdate) > "'+req.body.createdAfter+'T00:00:00"^^xsd:dateTime) '
            query += 'createdAfter='+req.body.createdAfter+'&'
        }
        if(req.body.createdBefore!=='') {
            criteriaStr += '   FILTER (xsd:dateTime(?cdate) < "'+req.body.createdBefore+'T00:00:00"^^xsd:dateTime) '
            query += 'createdBefore='+req.body.createdBefore+'&'
        }
        if(req.body.modifiedAfter!=='' || req.body.modifiedBefore!=='') {
            criteriaStr += '   ?subject dcterms:modified ?mdate . '
        }
        if(req.body.modifiedAfter!=='') {
            criteriaStr += '   FILTER (xsd:dateTime(?mdate) > "'+req.body.modifiedAfter+'T00:00:00"^^xsd:dateTime) '
            query += 'modifiedAfter='+req.body.modifiedAfter+'&'
        }
        if(req.body.modifiedBefore!=='') {
            criteriaStr += '   FILTER (xsd:dateTime(?mdate) < "'+req.body.modifiedBefore+'T00:00:00"^^xsd:dateTime) '
            query += 'modifiedBefore='+req.body.modifiedBefore+'&'
        }
        if(req.body.partStatus!=='Any iGEM Part Status') {
            criteriaStr += '   ?subject igem:partStatus \'' + req.body.partStatus.replace('\'','\\\'') + '\' . '
            query += 'igem:partStatus=\''+req.body.partStatus.replace('\'','\\\'')+'\'&'
        }
        if(req.body.sampleStatus!=='Any iGEM Sample Status') {
            criteriaStr += '   ?subject igem:sampleStatus \'' + req.body.sampleStatus.replace('\'','\\\'') + '\' . '
            query += 'igem:sampleStatus=\''+req.body.sampleStatus.replace('\'','\\\'')+'\'&'
        }
        if(req.body.status!=='Any iGEM Status') {
            criteriaStr += '   ?subject igem:status <' + igemNS + 'status/' + req.body.status + '> . '
            query += 'igem:status=<' + igemNS + 'status/' + req.body.status + '>&'
        }
        if(req.body.experience!=='Any iGEM Experience') {
            criteriaStr += '   ?subject igem:experience <' + igemNS + 'experience/' + req.body.experience + '> . '
            query += 'igem:experience=<' + igemNS + 'experience/' + req.body.experience + '>&'
        }
        if(req.body.type!=='Any Type') {
            criteriaStr += '   ?subject sbol2:type <' + biopaxNS + req.body.type + '> . '
            query += 'type=<' + biopaxNS + req.body.type + '>&'
        }
        var mappedRoles = {}; 
        for (var i = 0; i < this.lists.roleList.length; i++) {
            mappedRoles[this.lists.roleList[i].name] = this.lists.roleList[i];
        } 
        if(req.body.role!=='Any Role') {
            criteriaStr += '   ?subject sbol2:role <' +  mappedRoles[req.body.role].uri + '> . '
            query += 'role=<'+mappedRoles[req.body.role].uri+'>&'
        }
        if(req.body.partType!=='Any iGEM Part Type') {
            criteriaStr += '   ?subject sbol2:role <' + igemNS + 'partType/' + req.body.partType + '> . '
            query += 'role=<'+igemNS + 'partType/' + req.body.partType+'>&'
        }
        if(req.body.collection1) {
        var collections = req.body.collection1.toString().split(',')
        for (var i = 0; i < collections.length; i++) {
                criteriaStr +=           '   ?collection a sbol2:Collection .' +
            '   <' + collNS + collections[i] + '> sbol2:member ?subject .'
        query += 'collection=<' + collNS + collections[i] + '>&'
            }
    }
        if(req.body.description!=='') {
            criteriaStr += escape(
            'FILTER (CONTAINS(lcase(?displayId), lcase(%L))||CONTAINS(lcase(?name), lcase(%L))||CONTAINS(lcase(?description), lcase(%L)))', 
            req.body.description,req.body.description,req.body.description
            )
        }
        query += req.body.description
        criteria.push(criteriaStr)

        this.searchQuery = query

        if (req.originalUrl.endsWith('/createCollection')) {
            limit = 10000
        }

        let searchRes = await search.search(null, criteria, req.query.offset, limit, req.user)

        const count = searchRes.count
        const results = searchRes.results

        if (req.originalUrl.endsWith('/createCollection')) {

            throw new Error('create collection needs reimplementing')

            /*
            var sbol = new sboljs()
            var collection = sbol.collection()
            collection.displayId = req.body.metaId + '_collection'
            collection.version = req.body.metaVersion
            collection.persistentIdentity = config.get('databasePrefix') + 'user/' + req.user.username + '/' + req.body.metaId + '/' + collection.displayId
            collection.uri = collection.persistentIdentity + '/' + collection.version
            collection.name = req.body.metaName
            collection.description = req.body.metaDescription
            collection.addUriAnnotation('http://wiki.synbiohub.org/wiki/Terms/synbiohub#ownedBy', config.get('databasePrefix') + 'user/' + req.user.username)
            collection.addUriAnnotation('http://wiki.synbiohub.org/wiki/Terms/synbiohub#topLevel', collection.uri)

            for(let result of results) {
                collection.addMember(result.uri)
            }

            await sparql.upload(req.user.graphUri, serializeSBOL(sbol), 'application/rdf+xml')
            */
        }

        this.numResultsTotal = count

        this.results = results

        if (req.query.offset) {
            this.firstResultNum = parseInt(req.query.offset) + 1
            if (count < parseInt(req.query.offset) + results.length) {
                this.lastResultNum = count
            } else { 
                this.lastResultNum = parseInt(req.query.offset) + results.length
            }
        } else {
            this.firstResultNum = 1
            if (count < results.length) {
                this.lastResultNum = count
            } else { 
                this.lastResultNum = results.length
            }
        }

        if(results.length === 0)
            this.firstResultNum = 0
    }

}



async function getUriList(graphUri) {

    var creatorQuery = 'PREFIX dc: <http://purl.org/dc/elements/1.1/> SELECT DISTINCT ?object WHERE { ?tl dc:creator ?object }'

    var partStatusQuery = 'PREFIX igem: <http://wiki.synbiohub.org/wiki/Terms/igem#> SELECT DISTINCT ?object WHERE { ?tl igem:partStatus ?object }'

    var sampleStatusQuery = 'PREFIX igem: <http://wiki.synbiohub.org/wiki/Terms/igem#> SELECT DISTINCT ?object WHERE { ?tl igem:sampleStatus ?object }'

    var statusQuery = 'PREFIX igem: <http://wiki.synbiohub.org/wiki/Terms/igem#> SELECT DISTINCT ?object WHERE { ?tl igem:status ?object }'

    var experiencesQuery = 'PREFIX igem: <http://wiki.synbiohub.org/wiki/Terms/igem#> SELECT DISTINCT ?object WHERE { ?tl igem:experience ?object }'

    var typeQuery = 'PREFIX sbol2: <http://sbols.org/v2#> SELECT DISTINCT ?object WHERE { ?tl sbol2:type ?object }'

    var roleQuery = 'PREFIX sbol2: <http://sbols.org/v2#> SELECT DISTINCT ?object WHERE { ?tl a sbol2:ComponentDefinition .  ?tl sbol2:role ?object FILTER(STRSTARTS(str(?object),\'http://identifiers.org/so/\')) }'

    var igemRoleQuery = 'PREFIX sbol2: <http://sbols.org/v2#> SELECT DISTINCT ?object WHERE { ?tl a sbol2:ComponentDefinition . ?tl sbol2:role ?object FILTER(STRSTARTS(str(?object),\'http://wiki.synbiohub.org/wiki/Terms/igem#partType/\')) }'

    var collectionQuery = 'PREFIX sbol2: <http://sbols.org/v2#> SELECT DISTINCT ?object WHERE { ?object a sbol2:Collection }'

        function sortByNames(a, b) {
            if (a.name < b.name) {
                return -1
            } else {
                return 1
            }
        }

    let results = await Promise.all([

        sparql.queryJson(creatorQuery, graphUri).then((creatorList) => {

            creatorList.forEach((result) => {
                result.uri = result.object
                result.name = result.object
                delete result.object
            })	

            creatorList.sort(sortByNames)

            return Promise.resolve({ creatorList: creatorList })
        }),

        sparql.queryJson(partStatusQuery, graphUri).then((partStatusList) => {

            partStatusList.forEach((result) => {
                result.uri = result.object
                delete result.object
                result.name = result.uri
            })	

            partStatusList.sort(sortByNames)

            return Promise.resolve({ partStatusList: partStatusList })
        }),

        sparql.queryJson(sampleStatusQuery, graphUri).then((sampleStatusList) => {

            sampleStatusList.forEach((result) => {
                result.uri = result.object
                delete result.object
                result.name = result.uri
            })	

            sampleStatusList.sort(sortByNames)

            return Promise.resolve({ sampleStatusList: sampleStatusList })
        }),

        sparql.queryJson(statusQuery, graphUri).then((statusList) => {

            statusList.forEach((result) => {
                result.uri = result.object
                delete result.object
                result.name = result.uri.toString().replace(igemNS+'status/','')
            })	

            statusList.sort(sortByNames)

            return Promise.resolve({ statusList: statusList })
        }),

        sparql.queryJson(experiencesQuery, graphUri).then((experienceList) => {

            experienceList.forEach((result) => {
                result.uri = result.object
                delete result.object
                result.name = result.uri.toString().replace(igemNS+'experience/','')
            })

            experienceList.sort(sortByNames)

            return Promise.resolve({ experienceList: experienceList })
        }),

        sparql.queryJson(typeQuery, graphUri).then((typeList) => {

            typeList.forEach((result) => {
                result.uri = result.object
                delete result.object
                result.name = result.uri.toString().replace(biopaxNS,'')
            })

            typeList.sort(sortByNames)

            return Promise.resolve({ typeList: typeList })
        }),

        sparql.queryJson(roleQuery, graphUri).then((roleList) => {

            roleList.forEach((result) => {
                result.uri = result.object
                delete result.object
                var soTerm = result.uri.toString().replace(soNS,'')
                //var sbolmeta = require('sbolmeta')
                //var sequenceOntology = sbolmeta.sequenceOntology
                //result.name = sequenceOntology[soTerm].name
                result.name = 'todo'
            })

            roleList.sort(sortByNames)

            return Promise.resolve({ roleList: roleList })
        }),

        sparql.queryJson(igemRoleQuery, graphUri).then((igemRoleList) => {
            igemRoleList.forEach((result) => {
                result.uri = result.object
                delete result.object
                result.name = result.uri.toString().replace(igemNS+'partType/','')
            })

            igemRoleList.sort(sortByNames)

            return Promise.resolve({ igemRoleList: igemRoleList })
        }),

        sparql.queryJson(collectionQuery, graphUri).then((collectionList) => {

            collectionList.forEach((result) => {
                result.uri = result.object
                delete result.object
                result.name = result.uri.toString().replace(collNS,'')
            })

            collectionList.sort(sortByNames)

            return Promise.resolve({ collectionList: collectionList })
        })

    ])

    var allResults = {}

    for(let resultObj of results) {
        Object.keys(resultObj).forEach((key) => {
            allResults[key] = resultObj[key]
        })
    }

    return allResults
}

