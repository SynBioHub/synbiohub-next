// This file manages the rendering of the createImplementation form, its form validation, Implementation creation, and finally submission


var loadTemplate = require('../loadTemplate')
import config from 'synbiohub/config'
var pug = require('pug')
var sparql = require('../sparql/sparql')
var extend = require('xtend')
import parseForm from 'synbiohub/parseForm'

import { Response } from 'express'
const request = require('request')
const multiparty = require('multiparty')
const attachments = require('../attachments')
import uploads from '../uploads'
const fs = require('mz/fs')
import db from 'synbiohub/db'
import FMAPrefix from '../FMAPrefix'
import SBHURI from 'synbiohub/SBHURI';
import ViewConcerningTopLevel from './ViewConcerningTopLevel';
import { SBHRequest } from '../SBHRequest';
import { S2ProvPlan } from 'sbolgraph';

export default class ViewAddConstructToProject extends ViewConcerningTopLevel{

    redirect:string|null
    errors:any[]
    submission:any

    agentNames:any[]
    agentURIs:any[]

    plans:S2ProvPlan[]

    config:any

    canEdit:boolean

    constructName:string
    plan1:string
    plan2:string
    agent:string
    description:string
    location:string

    constructor(req) {
       
        super()

    }
    
    async prepare(req:SBHRequest){

        await super.prepare(req)

        if (req.method === 'POST'){

            await this.submitPost(req)
          }
      
          else{
      
            await this.submitForm(req, {}, {})
      
          }
    }

    async render(res:Response) {

        if(this.redirect) {
            res.redirect(this.redirect)
        } else {
            res.render('templates/views/addConstructToProject.jade', this)
        }

    }

    async submitForm(req, submissionData, locals){
    
        let uri = SBHURI.fromURIOrURL(req.url)
    
        this.errors = []
        
        await this.datastore.fetchPlans(this.graph)

        this.plans = this.graph.provPlans

        // for (let plan of plans){
        //   this.plan_names.push(plan['s'].split('/').pop())
        //   this.plan_uris.push(plan['s'])
        // }
    
        let users = await db.model.User.findAll()
    
        this.agentNames = users.map(x=>x.name)
        this.agentURIs= users.map(x=>x.graphUri)


        this.constructName = ''
        this.plan1 = ''
        this.plan2 = ''
        this.agent = ''
        this.description = ''
        this.location = ''
    
    
    }
    
    async submitPost(req){
    
        let uri = SBHURI.fromURIOrURL(req.url)
    
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
    
        var projectId = fields['construct_name'][0].replace(/\s+/g, '')
        var displayId = projectId + '_collection'
        var version = '1'
    
        var newURI = new SBHURI(uri.getUser(), projectId, displayId, version)
    
        var templateParams = {
            uri: newURI.toURI()
        }
    
        var countQuery = "PREFIX sbh: <http://wiki.synbiohub.org/wiki/Terms/synbiohub#> SELECT * WHERE { <" + templateParams['uri'] + "> sbh:topLevel  <" + templateParams['uri'] + ">}"
        var count = await sparql.queryJson(countQuery, uri.getGraph())
        count = JSON.parse(JSON.stringify(count))
    
        if (count!=0){
          errors.push('An entry with this name already exists.')
    
        }
    
        if (errors.length > 0) {

            this.errors = errors
            return
            
        }
    
        else{
    
            var org_search = await FMAPrefix.search('./data/ncbi_taxonomy.txt', fields['organism'][0])
            var taxId = org_search[0].split('|')[1]
    
            var form_vals = {
    
                prefix: uri.getURIPrefix(),
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
                graphUri: uri.getGraph(),
                uri: uri,
                collection_url: newURI
        
            }
            
    
            var sbol_results = await this.createSBOLImplementation(form_vals)
            var doc = sbol_results[0]
            var impl_uri = sbol_results[1]
    
            let fileStream = await fs.createReadStream(files['file'][0]['path']);
            var uploadInfo = await uploads.createUpload(fileStream)
            const { hash, size, mime } = uploadInfo
    
            if (files['file'][0]['size'] != 0){
    
                throw new Error('TODO reimplement')
                /*
              await attachments.addAttachmentToTopLevel(uri.getGraph(), baseUri, prefix + '/' + chosen_plan.replace(/\s+/g, ''),
              files['file'][0]['originalFilename'], hash, size, mime,
              graphUri.split('/').pop)
              */
            }
            
    
            await sparql.upload(req.getGraph(), doc.serializeXML(), 'application/rdf+xml')
    
            this.redirect = impl_uri
    
    
        }
    
    }
    
    async createSBOLImplementation(form_vals){
    
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
    
        throw new Error('needs porting to sbolgraph')
    
        /*
    
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
        */
    
    }

}


