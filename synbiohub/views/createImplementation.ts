// This file manages the rendering of the createImplementation form, its form validation, Implementation creation, and finally submission


var loadTemplate = require('../loadTemplate')
import config from 'synbiohub/config'
var pug = require('pug')
import getUrisFromReq from 'synbiohub/getUrisFromReq';
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
import FMAPrefix from '../FMAPrefix'

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

    res.send(pug.renderFile('templates/views/createImplementation.jade', locals))

}

async function submitPost(req, res){

    const { graphUri, uri, designId, baseUri, url } = getUrisFromReq(req)

    req.setTimeout(0) // no timeout

    let { fields, files } = await parseForm(req)

    var errors = []

    const submissionData = {
        construct_name: fields['construct_name'][0],
        plan1: fields['plan1'][0],
        plan2: fields['plan2'][0],
        agent: fields['agent'][0],
        description: fields['description'][0],
        location: fields['location'][0]

    }

    console.log(fields)

    var chosen_plan = ''
    var chosen_plan_uri = ''

    if (fields['construct_name'][0] === ''){

        errors.push('Please give the built design a name.')

    }

    if (fields['agent'][0] === ''){

      errors.push('Please mention who built the design.')

    }

    if (fields['description'][0] === ''){

        errors.push('Please mention the purpose of this built design.')

    }

    if (fields['location'][0] === ''){

        errors.push('Please mention where the built design is stored.')

    }

    if (fields['organism'][0] === ''){

        errors.push('Please mention which organism this construct was built in.')

    }

    if ('plan_submission_type[]' in fields){

      if (fields['plan2'][0] === ''){

          errors.push('Please mention which protocol was used in the lab.')

      }

      else {

        chosen_plan = fields['plan2'][0]
      }

      if (files['file'][0]['size'] === 0){

          errors.push('Please upload a file describing the lab protocol.')

      }

    }

    else{

      if (fields['plan1'][0] === ''){

          errors.push('Please select the protocol that was used in the lab.')

      }

      else {

        chosen_plan = JSON.parse(fields['plan1'])[1]
        chosen_plan_uri = JSON.parse(fields['plan1'])[0]
      }

    }

    var prefix = baseUri
    var displayId = fields['construct_name'][0].replace(/\s+/g, '')
    var version = '1'
    var collection_url = baseUri + '/' + baseUri.split('/').pop() + '_collection/' + version 

    var templateParams = {
        uri: prefix + '/' + displayId + '/' + version
    }

    var countQuery = "PREFIX sbh: <http://wiki.synbiohub.org/wiki/Terms/synbiohub#> SELECT * WHERE { <" + templateParams['uri'] + "> sbh:topLevel  <" + templateParams['uri'] + ">}"
    var count = await sparql.queryJson(countQuery, graphUri)
    count = JSON.parse(JSON.stringify(count))

    if (count!=0){
      errors.push('An entry with this name already exists.')

    }

    if (errors.length > 0) {
        if (req.forceNoHTML || !req.accepts('text/html')) {
            res.status(500).type('text/plain').send(errors)
            return
        } else {
            return submitForm(req, res, submissionData, {
                errors: errors
            })
        }
    }

    else{

        var org_search = await FMAPrefix.search('./alls.txt', fields['organism'][0])
        var taxId = org_search[0].split('|')[1]

        var form_vals = {

            prefix: prefix,
            displayId: displayId,
            version: version,
            agent_str: JSON.parse(fields['agent'])[1],
            agent_uri: JSON.parse(fields['agent'])[0],
            description: fields['description'][0],
            location: fields['location'][0],
            organism: fields['organism'][0],
            taxId: taxId,
            chosen_plan: chosen_plan,
            chosen_plan_uri: chosen_plan_uri,
            graphUri: graphUri,
            uri: uri,
            collection_url: collection_url
    
        }
        

        var sbol_results = await createSBOLImplementation(form_vals)
        var doc = sbol_results[0]
        var impl_uri = sbol_results[1]

        let fileStream = await fs.createReadStream(files['file'][0]['path']);
        var uploadInfo = await uploads.createUpload(fileStream)
        const { hash, size, mime } = uploadInfo

        if (files['file'][0]['size'] != 0){

          await attachments.addAttachmentToTopLevel(graphUri, baseUri, prefix + '/' + chosen_plan.replace(/\s+/g, ''),
          files['file'][0]['originalFilename'], hash, size, mime,
          graphUri.split('/').pop)
        }
        

        await sparql.upload(graphUri, doc.serializeXML(), 'application/rdf+xml')

        res.redirect(impl_uri)


    }

}

async function createSBOLImplementation(form_vals){

    var prefix = form_vals['prefix']
    var displayId = form_vals['displayId']
    var version = form_vals['version']
    var collection_url = form_vals['collection_url']
  
    var graphUri = form_vals['graphUri']
    var uri = form_vals['uri']
  
    var agent_str = form_vals['agent_str']
    var agent_uri = form_vals['agent_uri']
    var plan_str = form_vals['chosen_plan']
    var chosen_plan_uri = form_vals['chosen_plan_uri']
  
    var location = form_vals['location']
    var description = form_vals['description']
    var organism = form_vals['organism']
    var taxId = form_vals['taxId']



    var doc= new SBOLDocument();
    var document = doc

    var asc = doc.provAssociation(prefix + '/' + displayId + '_association/' + version)
    asc.displayId = displayId + '_association'
    asc.persistentIdentity = prefix + '/' + asc.displayId
    asc.version = version
    asc.addRole('http://sbols.org/v2#build')


    if (chosen_plan_uri === ''){

      var plan_uri = prefix + '/' + plan_str.replace(/\s+/g, '')
    }

    else{
      plan_uri = chosen_plan_uri
    }


    var agent = doc.provAgent(agent_uri)
    agent.displayId = agent_str
    agent.name = agent_str
    agent.persistentIdentity = agent_uri

    var plan = doc.provPlan(plan_uri)
    plan.displayId = plan_str.replace(/\s+/g, '')
    plan.name = plan_str
    plan.persistentIdentity = plan_uri

    agent.addUriAnnotation('http://wiki.synbiohub.org/wiki/Terms/synbiohub#topLevel', agent.uri)
    plan.addUriAnnotation('http://wiki.synbiohub.org/wiki/Terms/synbiohub#topLevel', plan.uri)

    asc.agent = agent_uri
    asc.plan = plan_uri

    var act = doc.provActivity(prefix + '/' + displayId + '_activity/' + version)
    act.displayId = displayId + '_activity'
    act.persistentIdentity = prefix + '/' + act.displayId
    act.version = version

    act.addUriAnnotation('http://wiki.synbiohub.org/wiki/Terms/synbiohub#topLevel', act.uri)
    act.addAssociation(asc)

    var usg = doc.provUsage(prefix + '/' + displayId + '_usage/' + version)
    usg.displayId = displayId + '_usage'
    usg.persistentIdentity = prefix + '/' + usg.displayId
    usg.version = version
    usg.entity = uri

    usg.addRole('http://sbols.org/v2#design')
    act.addUsage(usg)

    var impl = doc.implementation(prefix + '/' + displayId + '/' + version)
    impl.displayId = displayId
    impl.name = displayId
    impl.persistentIdentity = prefix + '/' + impl.displayId
    impl.version = version
    impl.description = description
    impl.built = prefix + '/' + displayId + '/' + version

    impl.addStringAnnotation('http://wiki.synbiohub.org/wiki/Terms/synbiohub#physicalLocation', location)
    impl.addWasGeneratedBy(act.uri)
    impl.wasDerivedFrom = uri
    impl.addStringAnnotation('http://wiki.synbiohub.org/wiki/Terms/synbiohub#ownedBy', graphUri)
    impl.addUriAnnotation('http://wiki.synbiohub.org/wiki/Terms/synbiohub#topLevel', impl.uri)
    impl.addUriAnnotation('http://w3id.org/synbio/ont#taxId', 'http://www.uniprot.org/taxonomy/' + taxId)
    impl.addStringAnnotation('http://www.biopax.org/release/biopax-level3.owl#organism', organism)
    var col = doc.collection(collection_url)
    col.addMember(impl)

    console.log(doc.serializeXML())

    return [doc, impl.uri]

}