import SBHURI from "synbiohub/SBHURI";
import parseForm from "synbiohub/parseForm";
import { SBOL2Graph, S2Identified } from "sbolgraph";
import SBOLUploader from "synbiohub/SBOLUploader";
import { OverwriteMergeOption } from "synbiohub/OverwriteMerge";
import loadTemplate from "synbiohub/loadTemplate";
import * as sparql from 'synbiohub/sparql/sparql';
const attachments = require('../attachments')
const fs = require('mz/fs')
import uploads from '../uploads'
import FMAPrefix from "synbiohub/FMAPrefix";
import Datastores from "synbiohub/datastore/Datastores";

export default async function (req, res) {

        let uri = SBHURI.fromURIOrURL(req.url)

        let { fields, files } = await parseForm(req)

        let type = fields["fieldType"][0]

        if (type === "plan"){
            await editPlan(fields, files, uri)
            
        }

        else if (type === "location"){
            await editLocation(fields, files, uri)
        }

        else if (type === "host"){
           await editHost(fields, files, uri)
        }

        else if (type === "metadata"){
            await editMetadata(fields, files, uri)
        }

        else if (type === "description"){
            await editDescription(fields, files, uri)
        }

        res.redirect(uri)

}

async function editPlan(fields, files, uri){

    let old_plan_id = fields["old_plan_id"][0]
    let old_plan_uri = uri.getURIPrefix() + old_plan_id + "/" + uri.getVersion()

    let new_plan_uri


    if (files['file'][0]['size'] == 0){
        new_plan_uri = SBHURI.fromURIOrURL(fields["plan1"][0].split(',')[0])

    }

    else{
        new_plan_uri = SBHURI.fromURIOrURL(uri.getURIPrefix() + fields["plan2"][0] + "/" + uri.getVersion())
    }

    let graph = new SBOL2Graph()

    let plan = graph.createProvPlan(new_plan_uri.getURIPrefix(), new_plan_uri.getDisplayId(), new_plan_uri.getVersion())
    plan.displayId = new_plan_uri.getDisplayId()
    plan.name = new_plan_uri.getDisplayId()
    
    let asc = graph.createProvAssociation(uri.getURIPrefix(), uri.getDisplayId() + '_association', uri.getVersion())

    asc.plan = plan

    let old_uri = SBHURI.fromURIOrURL(old_plan_uri)


    var templateParams = {
        subject:asc.uri,
        predicate:"http://www.w3.org/ns/prov#hadPlan",
        object:old_plan_uri
    }

    console.log(templateParams)

    var removeQuery = loadTemplate('sparql/removeSpecificURITriple.sparql', templateParams)

    await sparql.deleteStaggered(removeQuery, old_uri.getGraph())

    let uploader = new SBOLUploader()
    uploader.setGraph(graph)
    uploader.setDestinationGraphUri(new_plan_uri.getGraph())
    uploader.setOverwriteMerge(OverwriteMergeOption.FailIfExists)

    await uploader.upload()

    if (files['file'][0]['size'] != 0){

        let fileStream = await fs.createReadStream(files['file'][0]['path']);
        let uploadInfo = await uploads.createUpload(fileStream)
        const { hash, size, mime } = uploadInfo
        await attachments.addAttachmentToTopLevel(uri.getGraph(), uri.getURIPrefix() 
        , new_plan_uri,
        files['file'][0]['originalFilename'], hash, size, mime,
        uri.getGraph().split('/').pop)
    }

}

async function editLocation(fields, files, uri){

    let old_location = fields["old_location"][0]
    let new_location = fields["location"][0]

    let result = await getTypeObject(uri)

    let obj = result[0]
    let graph = result[1]
    let type = result[2]

    obj.setStringProperty('http://wiki.synbiohub.org/wiki/Terms/synbiohub#physicalLocation', new_location)

    var templateParams = {
        subject:obj.uri,
        predicate:"http://wiki.synbiohub.org/wiki/Terms/synbiohub#physicalLocation",
        object:old_location
    }

    var removeQuery = loadTemplate('sparql/removeSpecificLiteralTriple.sparql', templateParams)
    await sparql.deleteStaggered(removeQuery, uri.getGraph())

    let uploader = new SBOLUploader()
    uploader.setGraph(graph)
    uploader.setDestinationGraphUri(uri.getGraph())
    uploader.setOverwriteMerge(OverwriteMergeOption.FailIfExists)

    await uploader.upload()

}

async function editHost(fields, files, uri){

    let old_host = fields["old_host"]
    let new_host = fields['organism']

    let old_tax = await FMAPrefix.search('./data/ncbi_taxonomy.txt', old_host)

    let new_tax = await FMAPrefix.search('./data/ncbi_taxonomy.txt', new_host)

    let temp_graph = new SBOL2Graph()

    let datastore = Datastores.forSBHURI(uri)

    await datastore.fetchMetadata(temp_graph, new S2Identified(temp_graph, uri.toURI()))

    let types:Array<string> = temp_graph.getTypes(uri.toURI())

    let result = await getTypeObject(uri)

    let obj = result[0]
    let graph = result[1]

    let templateParams

    if (old_tax[0] != ''){

        templateParams = {
            subject:obj.uri,
            predicate:'http://w3id.org/synbio/ont#taxId',
            object:'http://www.uniprot.org/taxonomy/' + old_tax[0].split('|')[1]
        }
        let removeQuery = loadTemplate('sparql/removeSpecificURITriple.sparql', templateParams)

        await sparql.deleteStaggered(removeQuery, uri.getGraph())
    }

    templateParams = {
        subject:obj.uri,
        predicate:'http://www.biopax.org/release/biopax-level3.owl#organism',
        object:old_host
    }
    let removeQuery = loadTemplate('sparql/removeSpecificLiteralTriple.sparql', templateParams)

    await sparql.deleteStaggered(removeQuery, uri.getGraph())


    if (new_tax[0] != ''){

        obj.setUriProperty('http://w3id.org/synbio/ont#taxId', 'http://www.uniprot.org/taxonomy/' + new_tax[0].split('|')[1])

    }

    obj.setStringProperty('http://www.biopax.org/release/biopax-level3.owl#organism', new_host)

    console.log(graph.serializeXML())

    let uploader = new SBOLUploader()
    uploader.setGraph(graph)
    uploader.setDestinationGraphUri(uri.getGraph())
    uploader.setOverwriteMerge(OverwriteMergeOption.FailIfExists)

    await uploader.upload()

}

async function editMetadata(fields, files, uri){

    let old_metadata = fields["old_metadata"][0]

    let new_metadata = files["metadata_file"][0]

    let graph = new SBOL2Graph()

    let exp = graph.createExperiment(uri.getURIPrefix(), uri.getDisplayId(), uri.getVersion())

    let expData = graph.createExperimentalData(uri.getURIPrefix(), uri.getDisplayId() + '_metadata', uri.getVersion())

    exp.addExperimentalData(expData)

    let templateParams = {
        subject:uri,
        predicate:'http://sbols.org/v2#experimentalData',
        object:expData.uri
    }

    let removeQuery = loadTemplate('sparql/removeSpecificURITriple.sparql', templateParams)

    await sparql.deleteStaggered(removeQuery, uri.getGraph())

    let templateParams2 = {
        uri: expData.uri
    }
  
    removeQuery = loadTemplate('sparql/removeAttachments.sparql', templateParams2)

    await sparql.deleteStaggered(removeQuery, uri.getGraph())

    let uploader = new SBOLUploader()
    uploader.setGraph(graph)
    uploader.setDestinationGraphUri(uri.getGraph())
    uploader.setOverwriteMerge(OverwriteMergeOption.FailIfExists)

    await uploader.upload()

    let fileStream = await fs.createReadStream(new_metadata['path']);
    let uploadInfo = await uploads.createUpload(fileStream)
    const { hash, size, mime } = uploadInfo
    await attachments.addAttachmentToTopLevel(uri.getGraph(), uri.getURIPrefix() 
    , expData.uri,
    new_metadata['originalFilename'], hash, size, mime,
    uri.getGraph().split('/').pop)

}

async function editDescription(fields, files, uri){

    let old_description = fields["old_description"][0]
    let new_description = fields["description"][0]

    let templateParams = {
        subject:uri,
        predicate:'http://purl.org/dc/terms/description',
        object:old_description
    }

    let removeQuery = loadTemplate('sparql/removeSpecificLiteralTriple.sparql', templateParams)

    await sparql.deleteStaggered(removeQuery, uri.getGraph())

    let results = await getTypeObject(uri)
    let obj = results[0]
    let graph = results[1]

    obj.description = new_description

    let uploader = new SBOLUploader()
    uploader.setGraph(graph)
    uploader.setDestinationGraphUri(uri.getGraph())
    uploader.setOverwriteMerge(OverwriteMergeOption.FailIfExists)

    await uploader.upload()

}


async function getTypeObject(uri){

    let temp_graph = new SBOL2Graph()

    let datastore = Datastores.forSBHURI(uri)

    await datastore.fetchMetadata(temp_graph, new S2Identified(temp_graph, uri.toURI()))

    let types:Array<string> = temp_graph.getTypes(uri.toURI())

    let obj
    let type
    let graph = new SBOL2Graph()

    if(types.indexOf('http://sbols.org/v2#Implementation') !== -1) {

        obj = graph.createImplementation(uri.getURIPrefix(), uri.getDisplayId(), uri.getVersion())
        type = 'implementation'

    }

    else if(types.indexOf('http://sbols.org/v2#Experiment') !== -1){
        obj = graph.createExperiment(uri.getURIPrefix(), uri.getDisplayId(), uri.getVersion())
        type = 'experiment'

    }
    else if(types.indexOf('http://sbols.org/v2#ComponentDefinition') !== -1) {
        obj = graph.createComponentDefinition(uri.getURIPrefix(), uri.getDisplayId(), uri.getVersion())
        type = 'componentdefinition'
    }

    else if(types.indexOf('http://sbols.org/v2#ModuleDefinition') !== -1) {
        obj = graph.createModuleDefinition(uri.getURIPrefix(), uri.getDisplayId(), uri.getVersion())
        type = 'moduledefinition'

    }

    else if (types.indexOf('http://sbols.org/v2#Collection') !== -1){
        obj = graph.createCollection(uri.getURIPrefix(), uri.getDisplayId(), uri.getVersion())
        type = 'collection' 
    }

    return [obj, graph, type]
}