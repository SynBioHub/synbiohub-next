
import pug = require('pug');
import * as search from 'synbiohub/search';
import config from 'synbiohub/config';
import SBOLFetcherICE from '../fetch/SBOLFetcherICE';
import MDFetcherICE from 'synbiohub/fetch/MDFetcherICE';
import { SBHRequest } from 'synbiohub/SBHRequest';
import { Response } from 'express'
import View from 'synbiohub/views/View';

enum ResultMode {
    HTML,
    CountOnly,
    JSON
}

export default class ViewSearch extends View {

    entries:any[]

    results:any[]
    resultMode:ResultMode

    firstResultNum:number
    lastResultNum:number
    numResultsTotal:number
    limit:number


    constructor() {

        super()

        this.entries = []

        this.resultMode = ResultMode.HTML
        this.limit = 50
    }

    async prepare(req:SBHRequest) {

        await super.prepare(req)

        if (req.query.limit) {
            this.limit = req.query.limit
        }

        var criteria = [];

        if (req.params.query && req.params.query != '*') {
            criteria.push(search.lucene(req.params.query));
        }

        if (req.originalUrl.toString().endsWith('/uses')) {
            var designId;
            var uri;

            if (req.params.userId) {
                designId = req.params.collectionId + '/' + req.params.displayId + '/' + req.params.version
                uri = config.get('databasePrefix') + 'user/' + encodeURIComponent(req.params.userId) + '/' + designId
            } else {
                designId = req.params.collectionId + '/' + req.params.displayId + '/' + req.params.version
                uri = config.get('databasePrefix') + 'public/' + designId
            }

            criteria.push(
                ' { ?subject ?p <' + uri + '> } UNION { ?subject ?p ?use . ?use ?useP <' + uri + '> } .'
                + ' FILTER(?useP != <http://wiki.synbiohub.org/wiki/Terms/synbiohub#topLevel>)'
            )
        }

        if (req.originalUrl.toString().endsWith('/twins')) {
            var designId
            var uri
            if (req.params.userId) {
                designId = req.params.collectionId + '/' + req.params.displayId + '/' + req.params.version
                uri = config.get('databasePrefix') + 'user/' + encodeURIComponent(req.params.userId) + '/' + designId
            } else {
                designId = req.params.collectionId + '/' + req.params.displayId + '/' + req.params.version
                uri = config.get('databasePrefix') + 'public/' + designId
            }
            criteria.push(
                '   ?subject sbol2:sequence ?seq .' +
                '   ?seq sbol2:elements ?elements .' +
                '   <' + uri + '> a sbol2:ComponentDefinition .' +
                '   <' + uri + '> sbol2:sequence ?seq2 .' +
                '   ?seq2 sbol2:elements ?elements2 .' +
                '   FILTER(?subject != <' + uri + '> && ?elements = ?elements2)'
            )
        }

        // TODO: also search remotes

        let searchRes = await search.search(null, criteria, req.query.offset, this.limit, req.user)

        this.numResultsTotal = searchRes.count
        this.results = searchRes.results


        // TODO no idea what all this is about
        if (req.query.offset) {
            this.firstResultNum = parseInt(req.query.offset) + 1
            if (this.numResultsTotal < parseInt(req.query.offset) + this.results.length) {
                this.lastResultNum = searchRes.count
            } else {
                this.lastResultNum = parseInt(req.query.offset) + this.results.length
            }
        } else {
            this.firstResultNum = 1
            if (this.numResultsTotal < this.results.length) {
                this.lastResultNum = searchRes.count
            } else {
                this.lastResultNum = this.results.length
            }
        }


        if(req.originalUrl.indexOf("/searchCount") !== -1) {
            this.resultMode = ResultMode.CountOnly
        } else if(req.forceNoHTML || !req.accepts('text/html')) {
            this.resultMode = ResultMode.JSON
        }

    }

    async render(res:Response) {

        switch(this.resultMode) {

            case ResultMode.HTML:
                res.render('templates/views/search.jade', this)
                break

            case ResultMode.CountOnly:
                res.header('content-type', 'text/plain')
                res.send(this.numResultsTotal.toString())
                break

            case ResultMode.JSON:
                res.header('content-type', 'application/json')
                res.send(JSON.stringify(this.results))
                break
        }
    }
}

function objValues(obj) {

    return Object.keys(obj).map((key) => obj[key])

}

