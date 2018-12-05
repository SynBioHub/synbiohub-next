
var loadTemplate = require('../loadTemplate')
import config from 'synbiohub/config'
var pug = require('pug')
var sparql = require('../sparql/sparql')
var extend = require('xtend')
import parseForm from 'synbiohub/parseForm'

const request = require('request')
const multiparty = require('multiparty')
const attachments = require('../attachments')
import uploads from '../uploads'
const fs = require('mz/fs')
import db from 'synbiohub/db'
import FMAPrefix from '../FMAPrefix'
import { Response } from 'express'

import ViewConcerningTopLevel from './ViewConcerningTopLevel';
import { SBHRequest } from '../SBHRequest';
import SBHURI from '../SBHURI';
import { S2ProvPlan, S2Identified, S2Collection, SBOL2Graph } from 'sbolgraph';
import S2Implementation from 'sbolgraph/dist/sbol2/S2Implementation';
import SBOLUploader from '../SBOLUploader';
import { OverwriteMergeOption } from '../OverwriteMerge';

    

export default class ViewAddExperimentToProject extends ViewConcerningTopLevel{

    redirect:string|null
    errors:any[]

    agentNames:any[]
    agentURIs:any[]

    constructs:S2Identified[]

    
    plans:S2ProvPlan[]

    config:any

    canEdit:boolean

    experimentName:string
    construct:string
    plan1:string
    plan2:string
    agent:string
    description:string
    dataurl:string

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

        this.constructs = []

        let col = this.object as S2Collection

        await this.datastore.fetchMembersMetadata(this.graph, col)

        for (let member of col.members){

            if (member instanceof S2Implementation){

                this.constructs.push(member)

            }
        }

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
            res.render('templates/views/addExperimentToProject.jade', this)
        }

    }
    

    async submitForm(req, submissionData, locals){

        let uri = SBHURI.fromURIOrURL(req.url)
    
        this.errors = []
        
        await this.datastore.fetchPlans(this.graph)

        this.plans = this.graph.provPlans

        this.experimentName = ''        
        this.plan1 = ''
        this.plan2 = ''
        this.agent = ''
        this.description = ''
        this.dataurl = ''
        this.construct = ''


    }



    async submitPost(req){

        let uri = SBHURI.fromURIOrURL(req.url)
    
        let { fields, files } = await parseForm(req)
    
        var errors = []
    
        console.log(fields)
        console.log(files)

        this.experimentName = fields['experimentName'][0]
        this.plan1 = fields['plan1'][0]
        this.plan2 = fields['plan2'][0]
        this.agent = fields['agent'][0]
        this.description = fields['description'][0]
        // this.construct = fields['construct'][0]

        var chosen_plan = ''
        var chosen_plan_uri = ''

        if (fields['experimentName'][0] === ''){
                errors.push('Please give the experiment a name.')
        }

        if (fields['agent'][0] === ''){
            errors.push('Please mention who performed the experiment.')
        }

        if (fields['description'][0] === ''){
            errors.push('Please mention the purpose of this experiment.')
        }

        if (fields['organism'][0] === ''){
            errors.push('Please mention the organism used in this experiment.')
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
                chosen_plan = fields['plan1'][0].split(',')[1]
                chosen_plan_uri = fields['plan1'][0].split(',')[0]
            }

        }


        if (files['metadata_file'][0]['size'] === 0){
            errors.push('Please upload a file containing metadata for the experiment.')

        }

        if (fields['dataurl'][0] === ''){
            errors.push('Please specify a URL that contains the experimental data.')
        }



        if (errors.length > 0) {
            this.errors = errors
            return
        }

        var projectId = fields['experimentName'][0].replace(/\s+/g, '')
        var displayId = projectId + '_experiment'
        var version = '1'
    
        var newURI = new SBHURI(uri.getUser(), projectId, displayId, version)

        var org_search = await FMAPrefix.search('./data/ncbi_taxonomy.txt', fields['organism'][0])
        var taxId = org_search[0].split('|')[1]

        var form_vals = {

            prefix: uri.getURIPrefix(),
            displayId: displayId,
            version: version,
            constructs: fields['constructs'],
            agent_str: fields['agent'][0].split(',')[1],
            agent_uri: fields['agent'][0].split(',')[0],
            description: fields['description'][0],
            dataurl: fields['dataurl'][0],
            organism: fields['organism'][0],
            taxId: taxId,
            chosen_plan: chosen_plan,
            chosen_plan_uri: chosen_plan_uri,
            graphUri: uri.getGraph(),
            uri: uri

        }

        
        var sbol_results = await this.createSBOLExperiment(form_vals)

        let doc = sbol_results[0] as SBOL2Graph
        let exp_uri = sbol_results[1]
        let expData_uri = sbol_results[2]
        let plan_uri = sbol_results[3]

        console.log(doc.serializeXML())

        if (files['file'] && files['file'][0]['size'] != 0){
            let fileStream = await fs.createReadStream(files['file'][0]['path']);
            let uploadInfo = await uploads.createUpload(fileStream)
            const { hash, size, mime } = uploadInfo
            await attachments.addAttachmentToTopLevel(uri.getGraph(), uri.getURIPrefix() 
            , plan_uri,
            files['file'][0]['originalFilename'], hash, size, mime,
            uri.getGraph().split('/').pop)
            
        }


        if (files['metadata_file'][0]['size'] != 0){

            let metaFileStream = await fs.createReadStream(files['metadata_file'][0]['path']);

            let metaUploadInfo = await uploads.createUpload(metaFileStream)
        
            var { hash, size, mime } = metaUploadInfo

            await attachments.addAttachmentToTopLevel(uri.getGraph(), uri.getURIPrefix()
            , expData_uri,
            files['metadata_file'][0]['originalFilename'], hash, size, mime,
            uri.getGraph().split('/').pop)
        }

        let uploader = new SBOLUploader()
        uploader.setGraph(doc)
        uploader.setDestinationGraphUri(this.uri.getGraph())
        uploader.setOverwriteMerge(OverwriteMergeOption.FailIfExists)

        await uploader.upload()

        this.redirect = exp_uri


    }


    createSBOLExperiment(form_vals):any{

        var prefix = form_vals['prefix']
        var displayId = form_vals['displayId']
        var version = form_vals['version']
    
        var graphUri = form_vals['graphUri']
        var uri = form_vals['uri']
    
        var agent_str = form_vals['agent_str']
        var agent_uri = form_vals['agent_uri']
        var plan_str = form_vals['chosen_plan']
        var chosen_plan_uri = form_vals['chosen_plan_uri']
    
        var dataurl = form_vals['dataurl']
        var description = form_vals['description']
        var organism = form_vals['organism']
        var taxId = form_vals['taxId']
        // let construct_uri = form_vals['construct']
        let constructs = form_vals['constructs']

  
        let graph = new SBOL2Graph()

        let asc = graph.createProvAssociation(prefix, displayId + '_association', version)
        asc.displayId = displayId + '_association'
        asc.persistentIdentity = prefix + '/' + asc.displayId
        asc.version = version
        asc.role = 'http://sbols.org/v2#test'

  
        if (chosen_plan_uri === ''){
            var plan_uri = prefix + plan_str.replace(/\s+/g, '') + '/1'
        }
    
        else{
             plan_uri = chosen_plan_uri
        }
            
        let planSBHuri = SBHURI.fromURIOrURL(plan_uri)

        let plan = graph.createProvPlan(planSBHuri.getURIPrefix(), planSBHuri.getDisplayId(),  planSBHuri.getVersion())
        plan.displayId = plan_str.replace(/\s+/g, '')
        plan.name = plan_str
        plan.persistentIdentity = planSBHuri.getPersistentIdentity()

        let agent = graph.createProvAgent(agent_uri, 'agent', '1')
        agent.displayId = agent_str
        agent.name = agent_str
        agent.persistentIdentity = agent_uri

        agent.setUriProperty('http://wiki.synbiohub.org/wiki/Terms/synbiohub#topLevel', agent.uri)
        plan.setUriProperty('http://wiki.synbiohub.org/wiki/Terms/synbiohub#topLevel', plan.uri)

        asc.agent = agent
        asc.plan = plan

        let act = graph.createProvActivity(prefix,  displayId + '_activity', version)
        act.displayId = displayId + '_activity'
        act.persistentIdentity = prefix + '/' + act.displayId
        act.version = version
  
        act.setUriProperty('http://wiki.synbiohub.org/wiki/Terms/synbiohub#topLevel', act.uri)

        asc.agent = agent
        asc.plan = plan

        // let construct = this.graph.getTopLevelsWithPrefix(construct_uri)[0] as S2Implementation


        let usg = graph.createProvUsage(prefix, displayId + '_usage', version)
        usg.displayId = displayId + '_usage'
        usg.persistentIdentity = prefix +  usg.displayId
        usg.version = version
        // usg.entity = construct
    
        usg.role = ('http://sbols.org/v2#build')

        act.usage =  usg
        act.association = asc  

        let exp = graph.createExperiment(prefix, displayId , version)
        exp.displayId = displayId
        exp.name = displayId
        exp.persistentIdentity = prefix + '/' + displayId
        exp.version = version
        exp.description = description

        // exp.construct = construct

        exp.activity = act

        for (let construct of constructs){

            let tempConstruct = new S2Implementation(graph, construct)

            exp.addConstruct(tempConstruct)
        }


        exp.setStringProperty('http://wiki.synbiohub.org/wiki/Terms/synbiohub#ownedBy', graphUri.uri)
        exp.setUriProperty('http://wiki.synbiohub.org/wiki/Terms/synbiohub#topLevel', exp.uri)
        exp.setUriProperty('http://w3id.org/synbio/ont#taxId', 'http://www.uniprot.org/taxonomy/' + taxId)
        exp.setStringProperty('http://www.biopax.org/release/biopax-level3.owl#organism', organism)
        exp.setUriProperty('http://purl.obolibrary.org/obo/NCIT_C114457', dataurl) //ONTOLOGY TERM FOR DIGITAL DATA REPOSITORY

        let expData = graph.createExperimentalData(prefix, displayId + '_metadata', version)
        
        exp.addExperimentalData(expData)

        let col_uri = SBHURI.fromURIOrURL(this.object.uri)

        let col = graph.createCollection(col_uri.getURIPrefix(), col_uri.getDisplayId(), col_uri.getVersion())

        col.addMember(exp)
  
        console.log(graph.serializeXML())
    
        return [graph, exp.uri, expData.uri, plan.uri]

    }



}