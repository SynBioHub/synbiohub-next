
import config from 'synbiohub/config';
import pug = require('pug');
import extend = require('xtend')
import { Parser as SparqlParser } from 'sparqljs';
import { Generator as SparqlGenerator } from 'sparqljs'
import * as sparql from 'synbiohub/sparql/sparql';
import checkQuery from 'synbiohub/checkSparqlQuery';
import { SBHRequest } from 'synbiohub/SBHRequest';
import { Response } from 'express'
import parseForm, { ParsedForm } from '../parseForm';
import View from 'synbiohub/views/View';

export default class ViewSPARQL extends View {

    query:string
    graph:string

    headers:any[]
    results:any[]
    errors:string[]

    constructor() {

        super()


        this.graph = 'public'

        this.headers = []
        this.results = []
        this.errors = []

        const defaultQuery = []

        const namespaces = config.get('namespaces')

        Object.keys(namespaces).forEach((prefix) => {
            defaultQuery.push('PREFIX ' + prefix.split(':')[1] + ': <' + namespaces[prefix] + '>')
        })

        defaultQuery.push('', '')

        this.query = defaultQuery.join('\n')
    }

    async prepare(req:SBHRequest) {

        await super.prepare(req)

        if(req.method === 'POST') {
            await this.prepareSparqlPost(req)
        } else {
            await this.prepareSparqlGet(req)
        }

    }

    private async prepareSparqlPost(req:SBHRequest) {

        this.graph = req.body.graph
        this.query = req.body.query

        var graphUri = this.graph === 'user' ? req.user.graphUri : null

        const parser = new SparqlParser()
        const generator = new SparqlGenerator()

        var parsedQuery;

        try {
            parsedQuery = parser.parse(this.query);
        } catch (e) {
            this.errors.push(e.stack)
            return
        }

        const queryString = generator.stringify(parsedQuery)

        try {
            checkQuery(parsedQuery, req.user)
        } catch (e) {
            this.errors.push(e.stack)
            return
        }

        let results = await sparql.queryJson(queryString, graphUri)

        let headers = new Set();

        results.forEach(result => {
            Object.keys(result).forEach(key => {
                headers.add(key);
            })
        })

        this.headers = Array.from(headers)
        this.results = results
    }

    private async prepareSparqlGet(req:SBHRequest) {
    }

    async render(res:Response) {

        res.render('templates/views/sparql.jade', this)

    }


}



