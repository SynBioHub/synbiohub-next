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
import { S2ProvPlan, SBOL2Graph, S2ComponentDefinition, S2ModuleDefinition } from 'sbolgraph';
import { Predicates } from 'bioterms';
import SBOLUploader from '../SBOLUploader';
import { OverwriteMergeOption } from '../OverwriteMerge';

export default class ViewAddConstructToProject extends ViewConcerningTopLevel{

    redirect:string|null
    errors:any[]

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

        let users = await db.model.User.findAll()
    
        this.agentNames = users.map(x=>x.name)
        this.agentURIs= users.map(x=>config.get('databasePrefix') + 'user/' + x.username)

        await this.datastore.fetchPlans(this.graph)

        this.plans = this.graph.provPlans

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
    
        console.log('HFUSDHFDSHFDSHFDHSFUDSHFDHSFHDUF')
        this.errors = []
        
        await this.datastore.fetchPlans(this.graph)

        this.plans = this.graph.provPlans

        // for (let plan of plans){
        //   this.plan_names.push(plan['s'].split('/').pop())
        //   this.plan_uris.push(plan['s'])
        // }

        this.constructName = ''
        this.plan1 = ''
        this.plan2 = ''
        this.agent = ''
        this.description = ''
        this.location = ''
    
    
    }
    
    async submitPost(req){
    
        let uri = SBHURI.fromURIOrURL(req.url)
    
        let { fields, files } = await parseForm(req) //FILES IS EMPTY
    
        var errors = []
    
        console.log(fields)
        console.log(files)

        this.constructName = fields['constructName'][0],
        this.plan1 = fields['plan1'][0],
        this.plan2 = fields['plan2'][0],
        this.agent = fields['agent'][0],
        this.description = fields['description'][0],
        this.location = fields['location'][0]
    
        var chosen_plan = ''
        var chosen_plan_uri = ''
    
        if (fields['constructName'][0] === ''){
    
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

        // NEED TO REIMPLEMENT FILES
        //   if (files['file'][0]['size'] === 0){
    
        //       errors.push('Please upload a file describing the lab protocol.')
    
        //   }
    
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

        
    
        if (errors.length > 0) {

            this.errors = errors
            return
            
        }

        console.log('ANSWER ME')
        
        var projectId = fields['constructName'][0].replace(/\s+/g, '')
        var displayId = projectId + '_construct'
        var version = '1'
    
        var newURI = new SBHURI(uri.getUser(), projectId, displayId, version)

        var org_search = await FMAPrefix.search('./data/ncbi_taxonomy.txt', fields['organism'][0])
        var taxId = org_search[0].split('|')[1]

        var form_vals = {

            prefix: uri.getURIPrefix(),
            displayId: displayId,
            version: version,
            agent_str: fields['agent'][0].split(',')[1],
            agent_uri: fields['agent'][0].split(',')[0],
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
        
        console.log('THERE')
        console.log(form_vals)

        let sbol_results = await this.createSBOLImplementation(form_vals)
        let doc = sbol_results[0]
        let impl_uri = sbol_results[1]

        // HAVE TO REIMPLEMENT FILE STUFF
        // let fileStream = await fs.createReadStream(files['file'][0]['path']);
        // let uploadInfo = await uploads.createUpload(fileStream)
        // const { hash, size, mime } = uploadInfo

        
        // if (files['file'][0]['size'] != 0){

        //     throw new Error('TODO reimplement')
        //     /*
        //     await attachments.addAttachmentToTopLevel(uri.getGraph(), baseUri, prefix + '/' + chosen_plan.replace(/\s+/g, ''),
        //     files['file'][0]['originalFilename'], hash, size, mime,
        //     graphUri.split('/').pop)
        //     */
        // }
        

        // THIS ISN'T ACTUALLY UPLOADING FOR SOME REASON
        let uploader = new SBOLUploader()
        uploader.setGraph(doc)
        uploader.setDestinationGraphUri(this.uri.getGraph())
        uploader.setOverwriteMerge(OverwriteMergeOption.FailIfExists)

        this.redirect = impl_uri
    
    }
    
    createSBOLImplementation(form_vals):any{
    
        let prefix = form_vals['prefix']
        let displayId = form_vals['displayId']
        let version = form_vals['version']
        let collection_url = form_vals['collection_url']
      
        let graphUri = form_vals['graphUri']
        let uri = form_vals['uri']
      
        let agent_str = form_vals['agent_str']
        let agent_uri = form_vals['agent_uri']
        let plan_str = form_vals['chosen_plan']
        let chosen_plan_uri = form_vals['chosen_plan_uri']
      
        let location = form_vals['location']
        let description = form_vals['description']
        let organism = form_vals['organism']
        let taxId = form_vals['taxId']
    
        // throw new Error('needs porting to sbolgraph')
    
        console.log(form_vals)
        let graph = new SBOL2Graph()


        let act = graph.createProvActivity(prefix,  displayId + '_activity/', version)
        act.displayId = displayId + '_activity'
        act.persistentIdentity = prefix + '/' + act.displayId
        act.version = version


        let asc = graph.createProvAssociation(prefix, displayId + '_association/', version)
        asc.displayId = displayId + '_association'
        asc.persistentIdentity = prefix + '/' + asc.displayId
        asc.version = version
        asc.role = 'http://sbols.org/v2#build'
    

        if (chosen_plan_uri === ''){
    
            var plan_uri = prefix + '/' + plan_str.replace(/\s+/g, '')
        }
      
        else{
            plan_uri = chosen_plan_uri
        }
      
      
        let agent = graph.createProvAgent(agent_uri, '', '')
        agent.displayId = agent_str
        agent.name = agent_str
        agent.persistentIdentity = agent_uri
    
        let plan = graph.createProvPlan(plan_uri, '', '')
        plan.displayId = plan_str.replace(/\s+/g, '')
        plan.name = plan_str
        plan.persistentIdentity = plan_uri
    

        agent.setUriProperty('http://wiki.synbiohub.org/wiki/Terms/synbiohub#topLevel', agent.uri)
        plan.setUriProperty('http://wiki.synbiohub.org/wiki/Terms/synbiohub#topLevel', plan.uri)
    
        asc.agent = agent
        asc.plan = plan
    
        let usg = graph.createProvUsage(prefix, displayId + '_usage/', version)
        usg.displayId = displayId + '_usage'
        usg.persistentIdentity = prefix + '/' + usg.displayId
        usg.version = version
        usg.entity = graph.createComponentDefinition(uri, '', '')
    
        usg.role = ('http://sbols.org/v2#design')
        act.usage =  usg


        let impl = graph.createImplementation(prefix, displayId, version)

        impl.displayId = displayId
        impl.name = displayId
        impl.persistentIdentity = prefix + '/' + impl.displayId
        impl.version = version
        impl.description = description

        // THIS.OBJECT RETURNS A COLLECTION
        // if(this.object instanceof S2ComponentDefinition ||
        //     this.object instanceof S2ModuleDefinition) {
        //     impl.built = this.object
        // } else {
        //     console.log(this.object)
        //     throw new Error('nope.')
        // }

        impl.setStringProperty('http://wiki.synbiohub.org/wiki/Terms/synbiohub#physicalLocation', location)
        impl.setStringProperty(Predicates.Prov.wasGeneratedBy, act.uri)
        impl.setStringProperty(Predicates.Prov.wasDerivedFrom, uri)
        impl.setStringProperty('http://wiki.synbiohub.org/wiki/Terms/synbiohub#ownedBy', graphUri)
        impl.setUriProperty('http://wiki.synbiohub.org/wiki/Terms/synbiohub#topLevel', impl.uri)
        impl.setUriProperty('http://w3id.org/synbio/ont#taxId', 'http://www.uniprot.org/taxonomy/' + taxId)
        impl.setStringProperty('http://www.biopax.org/release/biopax-level3.owl#organism', organism)


        // let col = graph.createCollection(collection_url, '', '')
        // col.add(impl)

        console.log(graph.serializeXML())
    
        return [graph, impl.uri]
    
    
    }

}


