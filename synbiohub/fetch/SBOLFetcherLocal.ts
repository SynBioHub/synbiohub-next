
import request = require('request-promise')
import SBOLFetcher, { FetchResult } from 'synbiohub/fetch/SBOLFetcher';
import n3ToSBOL from 'synbiohub/conversion/n3-to-sbol';
import saveN3ToRdfXml from 'synbiohub/conversion/save-n3-to-rdfxml';

import fs = require('mz/fs')

import SBOLDocument = require('sboljs')

import tmp = require('tmp-promise')

import * as sparql from 'synbiohub/sparql/sparql'
import serializeSBOL from 'synbiohub/serializeSBOL';
import config from 'synbiohub/config';


var resolveBatch = config.get('resolveBatch')
var webOfRegistries = config.get('webOfRegistries')
var databasePrefix = config.get('databasePrefix')

export default class SBOLFetcherLocal extends SBOLFetcher {

    private graphUri:string

    constructor(graphUri:string) {

        super()

        this.graphUri = graphUri


    }


    /* Fetches SBOL source for an SBOL object URI, returning the filename of a
    * temporary file containing the SBOL XML.
    * 
    * Intuitively, the SBOL object fetcher would use this and then load the
    * returned source into sboljs to return an object.  However, the requirements
    * are quite different: the SBOL object fetcher doesn't care about well-formatted
    * SBOL, and creating well-formatted SBOL from the results of SPARQL queries is
    * difficult and expensive.
    *
    * Because of this, when we retrieve SBOL to render, for example, the page for
    * a ComponentDefinition, we use the object fetcher.  The object fetcher works
    * by loading the results of multiple SPARQL queries into an sboljs SBOLDocument,
    * and then when the SBOLDocument is complete it can be used to render the page.
    *
    * While the source fetcher is generally more expensive because of the overhead
    * of conversion to well-formed SBOL, the object fetcher simply cannot handle 
    * large documents because it relies on sboljs building an RDF graph in memory.
    * So when we want to produce an SBOL document to return to the user, we use
    * the source fetcher, which has an elaborate pipeline of retrieving chunks
    * of N3 triples, converting them to RDF+XML using a script, then converting
    * the RDF+XML to SBOL XML using libSBOLj.  The source fetcher also returns
    * a filename rather than a string to avoid loading huge documents into 
    * memory.
    *
    * TODO: should the final resulting file be streamed into gzip so the gzipped
    * file can be sent as the response?
    *
    */
    async fetchSBOLSource(uri:string, type:string) {

        const sbol = new SBOLDocument()

        sbol._resolving = {};
        sbol._rootUri = uri

        /* First check if this object is a collection.  If so, we can use the
        * specialized collection query to retrieve it without a recursive crawl.
        */
        let results = await sparql.queryJson([
            'SELECT ?coll WHERE {',
            '?coll a <http://sbols.org/v2#Collection> .',
            'FILTER(?coll = <' + sbol._rootUri + '>)',
            '}'
        ].join('\n'), this.graphUri)

        // TODO: temporarily removed, need to add recursive crawl after this 
        // to ensure non-local objects are fetched.
        if (results.length > 0) {

            /* It's a collection.  Hooray, we can use the more efficient
            * collection fetcher!
            */
            return await this.fetchCollectionSBOLSource(uri, type, sbol)

        } else {

            /* It's not a collection, so this is going to be a recursive
            * crawl.  We need sboljs to work out which URIs are unresolved, so
            * just fall back on using fetchSBOLObject and serializing it
            * afterwards.
            *
            * Unfortunately, we also need to save the serialized XML to a file
            * because the other fetcher returns a filename...
            *
            * TODO: we probably don't need to use sboljs to find out which
            * URIs aren't resolved.  Bypassing this would avoid building an
            * RDF graph in memory.
            *
            * TODO: this causes the query to check for a collection to
            * run again
            */
            let res = await this.fetchSBOLObjectRecursive(uri, type, sbol)

            let tmpFilename = await tmp.tmpName()

            await fs.writeFile(tmpFilename, serializeSBOL(res.sbol))

            return tmpFilename
        }

    }

    /* Retrieves an SBOL object *recursively*, in that anything it references, and
    * anything those objects reference (and so on) are resolved.  This is hugely
    * expensive (> 10 minutes) for large Collections, which is why the Collection
    * page currently uses metadata instead of an sboljs object.
    *
    * TODO: the collection page can use SBOL, it just needs to use the not yet
    * implemented "fetch SBOL object and children".  There's also no reason that
    * for example a ComponentDefinition couldn't have millions of components
    * (human genome?), so we should probably make sure that none of the pages for
    * top levels rely on recursively resolved SBOL documents and make them use
    * the "object and children" fetcher instead.
    *
    * TODO: make the recursive crawl fail for things that are obviously too big
    * to resolve everything.
    */
    async fetchSBOLObjectRecursive(uri:string, type?:string, sbol?:SBOLDocument):Promise<FetchResult> {

        sbol = sbol || new SBOLDocument()

        sbol._resolving = {};
        sbol._rootUri = uri

        sbol.lookupURI(sbol._rootUri)

        // console.log(sbol)
        // console.log(type)
        // console.log(uri)

        let results = await sparql.queryJson([
            'SELECT ?coll ?type WHERE {',
            '?coll a ?type .',
            'FILTER(?coll = <' + sbol._rootUri + '>)',
            '}'
        ].join('\n'), this.graphUri)

        if (results.length > 0) {

            // TODO: temporarily removed, need to add recursive crawl after this
            // to ensure non-local objects are fetched.
            if (results[0].type === 'http://sbols.org/v2#Collection') {

                return await this.getCollectionSBOL(sbol, type)

            } else {

                return await this.getSBOLRecursive(sbol, type)

            }

        } else {

            let e = new Error(sbol._rootUri + ' not found')
            e.name = 'NotFound'
            throw e

        }

    }

    private async fetchCollectionSBOLSource(uri:string, type?:string, sbol?:SBOLDocument) {

        var graphs = ''
        //if (graphUri) {
        //graphs = 'FROM <' + config.get('triplestore').defaultGraph + '> FROM <' + graphUri + '>'
        //}

        const subquery = [
            '{',
                '?s ?p ?o .',
                'FILTER(?s = <' + sbol._rootUri + '>)',
            '}',
            'UNION',
            '{',
                '?coll <http://sbols.org/v2#member> ?topLevel .',
                '?s <http://wiki.synbiohub.org/wiki/Terms/synbiohub#topLevel> ?topLevel .',
                '?s ?p ?o .',
                'FILTER(?coll = <' + sbol._rootUri + '>)',
            '}' /*,
            'UNION',
            '{',
                '?coll <http://sbols.org/v2#member> ?topLevel .',
            '?topLevel a <http://sbols.org/v2#ComponentDefinition> .',
                '?topLevel <http://sbols.org/v2#sequence> ?sequence .',
                '?s <http://wiki.synbiohub.org/wiki/Terms/synbiohub#topLevel> ?sequence .',
                '?s ?p ?o .',
                'FILTER(?coll = <' + sbol._rootUri + '>)',
            '}',
            'UNION',
            '{',
                '?coll <http://sbols.org/v2#member> ?topLevel .',
            '?topLevel a <http://sbols.org/v2#ModuleDefinition> .',
                '?topLevel <http://sbols.org/v2#model> ?model .',
                '?s <http://wiki.synbiohub.org/wiki/Terms/synbiohub#topLevel> ?model .',
                '?s ?p ?o .',
                'FILTER(?coll = <' + sbol._rootUri + '>)',
            '}'*/
        ].join('\n')

        let results = await sparql.queryJson([
            'SELECT (COUNT(*) as ?count) ' + graphs + ' WHERE {',
            subquery,
            '}'
        ].join('\n'), this.graphUri)

        var countLeft = results[0].count
        var offset = 0
        var limit = config.get('staggeredQueryLimit')

        var n3 = []

        let graphUri = this.graphUri

        return await doNextQuery()


        async function doNextQuery() {

            //console.log(countLeft + ' left of ' + results[0].count)

            if(countLeft > 0) {

                let query = ['CONSTRUCT { ?s ?p ?o } ' + graphs + ' WHERE { { SELECT ?s ?p ?o WHERE {',
                        subquery,
                        '} ORDER BY ASC(?s) ASC(?p) ASC(?o)} } OFFSET ' + offset + ' LIMIT ' + limit].join('\n')
                //console.log(query)

                let res = await sparql.query(query, graphUri, 'text/plain')

                n3.push(res.body)

                countLeft -= limit
                offset += limit

                return await doNextQuery()

            } else {

                return await n3ToSBOL(n3)

            }
        }
    }

    private async getCollectionSBOL(sbol, type) {

        var graphs = ''
        //if (graphUri) {
    //	graphs = 'FROM <' + config.get('triplestore').defaultGraph + '> FROM <' + graphUri + '>'
        //}

        const subquery = [
            '{',
                '?s ?p ?o .',
                'FILTER(?s = <' + sbol._rootUri + '>)',
            '}',


            // SBH2: no members plz
            /*
            'UNION',
            '{',
                '?coll <http://sbols.org/v2#member> ?topLevel .',
                '?s <http://wiki.synbiohub.org/wiki/Terms/synbiohub#topLevel> ?topLevel .',
                '?s ?p ?o .',
                'FILTER(?coll = <' + sbol._rootUri + '>)',
            '}'*/
            
            
            
            /*,
            'UNION',
            '{',
                '?coll <http://sbols.org/v2#member> ?topLevel .',
            '?topLevel a <http://sbols.org/v2#ComponentDefinition> .',
                '?topLevel <http://sbols.org/v2#sequence> ?sequence .',
                '?s <http://wiki.synbiohub.org/wiki/Terms/synbiohub#topLevel> ?sequence .',
                '?s ?p ?o .',
                'FILTER(?coll = <' + sbol._rootUri + '>)',
            '}',
            'UNION',
            '{',
                '?coll <http://sbols.org/v2#member> ?topLevel .',
            '?topLevel a <http://sbols.org/v2#ModuleDefinition> .',
                '?topLevel <http://sbols.org/v2#model> ?model .',
                '?s <http://wiki.synbiohub.org/wiki/Terms/synbiohub#topLevel> ?model .',
                '?s ?p ?o .',
                'FILTER(?coll = <' + sbol._rootUri + '>)',
            '}'*/
        ].join('\n')

    // console.log(subquery)
        let results = await sparql.queryJson([
            'SELECT (COUNT(*) as ?count) ' + graphs + ' WHERE {',
            subquery,
            '}'
        ].join('\n'), this.graphUri)

        var countLeft = results[0].count
        var offset = 0
        var limit = config.get('staggeredQueryLimit')

        var rdf = []

        let graphUri = this.graphUri

        return await doNextQuery()

        async function doNextQuery() {

            console.log(countLeft + ' left of ' + results[0].count)

            if(countLeft > 0) {

                let res = await sparql.query([
                    'CONSTRUCT { ?s ?p ?o } ' + graphs + ' WHERE { { SELECT ?s ?p ?o WHERE {',
                    subquery,
                    '} ORDER BY ASC(?s) ASC(?p) ASC(?o)} } OFFSET ' + offset + ' LIMIT ' + limit
                ].join('\n'), graphUri, 'text/plain')

                rdf.push(res.body)

                countLeft -= limit
                offset += limit

                return await doNextQuery()

            } else {

                let tempFilename = await saveN3ToRdfXml(rdf)

                let contents = await fs.readFile(tempFilename)

                fs.unlink(tempFilename)

                return await new Promise((resolve, reject) => {
                    sbol.loadRDF(contents.toString(), (err) => {

                        if(err) {
                            reject(err)
                            return
                        }

                        const object = sbol.lookupURI(sbol._rootUri)

                        sbol.graphUri = graphUri
                        object.graphUri = graphUri

                        resolve({
                            graphUri: graphUri,
                            sbol: sbol,
                            object: object
                        })
                    })

                })
            }

        }
    }

    private async getSBOLRecursive(sbol, type):Promise<FetchResult> {

        await this.completePartialDocument(sbol, type, new Set([]))

        for(let uri of sbol.unresolvedURIs) {

            // TODO: temporary until URIs fixed
            if (uri.toString().startsWith('http://wiki.synbiohub.org/')) {
                continue
            }

            let prefix = uri.toString()

            if (prefix.indexOf('/public/') !== -1) {
                prefix = prefix.substring(0, prefix.indexOf('/public/'))
            } else if (prefix.indexOf('/user/') !== -1) {
                prefix = prefix.substring(0, prefix.indexOf('/user/'))
                if (uri.toString().replace(prefix + '/user/', '').indexOf('/') === -1) {
                    prefix = uri.toString()
                }
            }

            if (!webOfRegistries[prefix])
                continue

            uri = uri.replace(prefix, webOfRegistries[prefix]) + '/sbol'

            console.log('Fetching non-local:' + uri)

            let body = await request({
                method: 'GET',
                uri: uri,
                'content-type': 'application/rdf+xml',
            })

            if(body.startsWith('<!DOCTYPE html><'))
                continue

            await new Promise((resolve, reject) => {
                sbol.loadRDF(body, (err) => {
                    if (err)
                        reject(err)
                    else
                        resolve(body)
                })
            })
        }

        return {
            sbol: sbol,
            object: sbol.lookupURI(sbol._rootUri),
            remote: null
        }
    }

    private async completePartialDocument(sbol, type, skip) {

        //console.log(sbol.unresolvedURIs.length + ' unresolved URI(s)')

        if(sbol.unresolvedURIs.length === 0)
            return

        var toResolve = sbol.unresolvedURIs.filter((uri) => !sbol._resolving[uri] &&
                        !skip.has(uri.toString()) && uri.toString().startsWith(databasePrefix))
                                .map((uri) => uri.toString())

        toResolve = toResolve.slice(0, resolveBatch)

        await this.retrieveSBOL(sbol, type, toResolve)


        var done = true

        // somehow we killed the optimiser by doing uri toString inside
        // the loop, so let's do it first...
        //
        // ~50 seconds -> instant, thanks v8
        //
        var uriStrings = sbol.unresolvedURIs.map((uri) => uri.toString())

        for (var i = 0; i < uriStrings.length; ++i) {
            var uri = uriStrings[i]

            var uriString = uri

            if (toResolve.indexOf(uriString) === -1 && uriString.startsWith(databasePrefix) && !skip.has(uriString)) {
                done = false
            } else {
                skip.add(uriString)
            }
        }

        if (done)
            return

        await this.completePartialDocument(sbol, type, skip)

    }

    private sparqlDescribeSubjects(sbol, type, uris, isCount) {

        /*
        var triples = uris.map((uri, n) =>
            sparql.escapeIRI(uri) + ' ?p' + n + ' ?o' + n + ' .'
        )

        return [
            'CONSTRUCT {'
        ].concat(triples).concat([
            '} WHERE {'
        ]).concat(triples).concat([
            '}'
        ]).join('\n')*/

        var query = [
            isCount ?
                'SELECT (count(?s) as ?count) WHERE {'
                :
                'CONSTRUCT { ?s ?p ?o } WHERE {'
        ]

        var isFirst = true

        uris.forEach((uri) => {

            if (isFirst)
                isFirst = false
            else
                query.push('UNION')

            query.push(
                '{',
                '?s ?p ?o .'
            )

            if (uri === sbol._rootUri) {
                if (type) {
                    if (type === "TopLevel") {
                        query.push('?s a ?t .')
                        // TODO: the generic top level will not work
                        query.push('FILTER(?t = <http://sbols.org/v2#ComponentDefinition>' + ' ||' +
                            ' ?t = <http://sbols.org/v2#ModuleDefinition>' + ' ||' +
                            ' ?t = <http://sbols.org/v2#Model>' + ' ||' +
                            ' ?t = <http://sbols.org/v2#Collection>' + ' ||' +
                            ' ?t = <http://sbols.org/v2#Sequence>' + ' ||' +
                            ' ?t = <http://sbols.org/v2#GenericTopLevel>)')
                    } else if (type != 'GenericTopLevel') {
                        query.push('?s a <http://sbols.org/v2#' + type + '> .')
                    }
                }
            }

            query.push(
                'FILTER(?s = ' + sparql.escapeIRI(uri) + ')',
                '}'
            )
        })

        query.push('}')

        return query.join('\n')
    }

    private async retrieveSBOL(sbol, type, uris) {

        Object.assign(sbol._resolving, uris)

        var countQuery = this.sparqlDescribeSubjects(sbol, type, uris, true)

        var query = this.sparqlDescribeSubjects(sbol, type, uris, false)

        var offset = 0
        var limit = config.get('staggeredQueryLimit')
        var countLeft

        let res = await sparql.queryJson(countQuery, this.graphUri)

        //console.log('count is ' + res[0].count)

        countLeft = res[0].count

        // if(countLeft === 0) {

        //     console.log(countQuery)

        //     next(new Error('incomplete document?'))
        //     return

        // }

        var rdf = []

        let graphUri = this.graphUri

        return await doQuery()

        async function doQuery() {

            let res = await sparql.query(query + ' OFFSET ' + offset + ' LIMIT ' + limit, graphUri, 'application/rdf+xml')

            countLeft -= limit
            offset += limit

            rdf.push(res.body)

            if (countLeft > 0) {

                return await doQuery()

            } else {

                //console.log('loading rdf')

                return await new Promise((resolve, reject) => {
                    sbol.loadRDF(rdf, (err) => {
                        if (err)
                            reject(err)
                        else
                            resolve()
                    })
                })

            }
        }

    }
}









