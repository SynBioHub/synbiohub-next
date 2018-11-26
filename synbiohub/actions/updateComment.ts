import SBHURI from "../SBHURI";
import { SBOL2Graph, S2Identified, node, S2Collection, S2ComponentDefinition, S2ModuleDefinition, S2Sequence, S2Attachment, S2Implementation, SEP21Experiment } from "sbolgraph";
import S2IdentifiedFactory from './sbol2/S2IdentifiedFactory';
import Datastores from "../datastore/Datastores";
import parseForm from "../parseForm";
import SBOLUploader from "../SBOLUploader";
import { OverwriteMergeOption } from "../OverwriteMerge";
import * as sparql from 'synbiohub/sparql/sparql';
import loadTemplate from "../loadTemplate";
import { Types } from "bioterms";
import S2Model from "sbolgraph/dist/sbol2/S2Model";

export default async function (req, res) {

    let uri:SBHURI = SBHURI.fromURIOrURL(req.url)

    console.log(uri.toURI())

    let datastore = Datastores.forSBHURI(uri)
    let graph = new SBOL2Graph()

    let object = new S2Identified(graph, uri.toURI())
    await datastore.fetchMetadata(graph, object)
    let types:Array<string> = graph.getTypes(uri.toURI())

    if(types.indexOf('http://sbols.org/v2#Collection') !== -1) {
        object = new S2Collection(graph, uri.toURI())
    } else if(types.indexOf('http://sbols.org/v2#ComponentDefinition') !== -1) {
        object = new S2ComponentDefinition(graph, uri.toURI())
    } else if(types.indexOf('http://sbols.org/v2#ModuleDefinition') !== -1) {
        object = new S2ModuleDefinition(graph, uri.toURI())
    } else if(types.indexOf('http://sbols.org/v2#Sequence') !== -1) {
        object = new S2Sequence(graph, uri.toURI())
    } else if(types.indexOf('http://sbols.org/v2#Model') !== -1) {
        object = new S2Model(graph, uri.toURI())
    } else if(types.indexOf('http://sbols.org/v2#Attachment') !== -1) {
        object = new S2Attachment(graph, uri.toURI())
    } else if(types.indexOf('http://wiki.synbiohub.org/wiki/Terms/synbiohub#Attachment') !== -1) {
        object = new S2Attachment(graph, uri.toURI())
    } else if(types.indexOf('http://sbols.org/v2#Implementation') !== -1){
        object = new S2Implementation(graph, uri.toURI())
    } else if(types.indexOf('https://github.com/SynBioDex/SEPs/blob/sep21/sep_021.md#Experiment') !== -1){
        object = new SEP21Experiment(graph, uri.toURI())

    }
    
    let { fields, files } = await parseForm(req)
    
    let currentComment = fields['comment'][0]
    
    // object.setUriProperty('http://purl.obolibrary.org/obo/NCIT_C25393')

    // await datastore.fetchEverything(graph, object)
    await datastore.fetchEverything(graph, new S2Identified(graph, uri.toURI()))

    let commentHistory = object.getUriProperties('http://www.w3.org/1999/02/22-rdf-syntax-ns#comment')

    console.log(commentHistory)

    object.setStringProperty('http://www.w3.org/1999/02/22-rdf-syntax-ns#comment', currentComment + ' - ' + String(commentHistory.length))

    console.log(graph.serializeXML())

    let templateParams = {
        uri: uri.toURI()
    }

    // let removeQuery = loadTemplate('sparql/removeComment.sparql', templateParams)
    // await sparql.deleteStaggered(removeQuery, uri.getGraph())

    let uploader = new SBOLUploader()
    uploader.setGraph(graph)
    uploader.setDestinationGraphUri(uri.getGraph())
    uploader.setOverwriteMerge(OverwriteMergeOption.OverwriteIfExists)
    await uploader.upload()

}