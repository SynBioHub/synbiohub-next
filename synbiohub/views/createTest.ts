
var loadTemplate = require('../loadTemplate')
import config from 'synbiohub/config'
var pug = require('pug')
import getUrisFromReq from 'synbiohub/getUrisFromReq'
var sparql = require('../sparql/sparql')
var SBOLDocument = require('sboljs')
var extend = require('xtend')
import parseForm from 'synbiohub/parseForm'

const request = require('request')
const multiparty = require('multiparty')
const uriToUrl = require('../uriToUrl')
const attachments = require('../attachments')
import uploads from '../uploads'
const fs = require('mz/fs')
import db from 'synbiohub/db'

export default function(req, res) {

    if (req.method === 'POST'){

      submitPost(req, res)
    }

    else{

      submitForm(req, res, {}, {})

    }

}

async function submitForm(req, res, submissionData, locals){
    const { graphUri, uri, designId, baseUri, url } = getUrisFromReq(req)

    req.setTimeout(0) // no timeout
    
    var plan_names = []
    var plan_uris = []

    var submissionData = extend({
        createdBy: req.user,
    }, submissionData)

    var locals = extend({
      config: config.get(),
      user: req.user,
      errors: [],
      submission: submissionData,
      canEdit: true,
    }, locals)

    var plan_query = "PREFIX prov: <http://www.w3.org/ns/prov#> SELECT ?s WHERE { ?s a prov:Plan .}"


    let plans = await sparql.queryJson(plan_query, graphUri)


    for (var plan of plans){
      plan_names.push(plan['s'].split('/').pop())
      plan_uris.push(plan['s'])
    }

    let users = await db.model.User.findAll()


    locals = extend({
      agent_names: users.map(x=>x.name),
      agent_uris: users.map(x=>x.graphUri),
      plan_names: plan_names,
      plan_uris: plan_uris
    }, locals)

    res.send(pug.renderFile('templates/views/createTest.jade', locals))

}


async function submitPost(req, res){

}


