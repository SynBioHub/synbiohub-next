import { S2Collection, SBOL2Graph } from "sbolgraph";
import config from "synbiohub/config";
import Datastores from "synbiohub/datastore/Datastores";
import { OverwriteMergeOption } from "synbiohub/OverwriteMerge";
import SBHURI from "synbiohub/SBHURI";
import SBOLUploader from "synbiohub/SBOLUploader";
import loadTemplate from "synbiohub/loadTemplate";
import * as sparql from 'synbiohub/sparql/sparql';

export default async function(req, res) {

    console.log('CELLLøøøøøøø')

    let uri = SBHURI.fromURIOrURL(req.url)

    let graph = new SBOL2Graph()

    let datastore = Datastores.forSBHURI(uri)
    
    let collection = new S2Collection(graph, uri.toURI())

    await datastore.fetchTopLevel(graph, collection)

    for(let member of collection.members) {
        await datastore.fetchTopLevel(graph, member)
    }


    console.log(graph.serializeXML())
    graph.changeURIPrefix(config.get('triplestore').defaultGraph + '/')

    console.log(graph.serializeXML())

    var templateParams = {
        uri: uri
      }
  
    var removeQuery = loadTemplate('sparql/remove.sparql', templateParams)

    await sparql.deleteStaggered(removeQuery, uri.getGraph())

    let publicDatastore = Datastores.public(req.user)

    let uploader = new SBOLUploader()
    uploader.setDestinationGraphUri(config.get('triplestore').defaultGraph)
    uploader.setOverwriteMerge(OverwriteMergeOption.FailIfExists)
    uploader.setGraph(graph)

    await uploader.upload()

    res.redirect('/projects')
}