
import async = require('async');
import config from 'synbiohub/config';
import pug = require('pug');
import ViewCollection from 'synbiohub/views/ViewCollection';
import ViewComponentDefinition from './ViewComponentDefinition';
import ViewModuleDefinition from 'synbiohub/views/ViewModuleDefinition';
import ViewSequence from './ViewSequence';
import ViewModel from './ViewModel';
import ViewSBOLAttachment from './ViewSBOLAttachment';
import ViewAttachment from './ViewAttachment';
import ViewGenericTopLevel from './ViewGenericTopLevel';
import ViewImplementation from './ViewImplementation';
import ViewTest from './ViewTest';
import SBHURI from 'synbiohub/SBHURI';
import { SBOL2Graph, S2Identified } from 'sbolgraph';
import Datastores from '../datastore/Datastores';

var sparql = require('../sparql/sparql')

export default async function(req, res) {

    let uri:SBHURI = SBHURI.fromURIOrURL(req.url)

    let datastore = Datastores.forSBHURI(uri)
    let graph:SBOL2Graph = new SBOL2Graph()
    await datastore.fetchMetadata(graph, new S2Identified(graph, uri.toURI()))

    let type = graph.getType(uri.toURI())

    var view

    if(type==='http://sbols.org/v2#Collection') {

        let test_query = "PREFIX sbh: <http://wiki.synbiohub.org/wiki/Terms/synbiohub#> SELECT ?o WHERE {<" + uri +  "> sbh:Test ?o}"

        let result = await sparql.queryJson(test_query, uri.getGraph())

        if (result.length === 1){
            view = new ViewTest()
        }

        else{
            view = new ViewCollection()

        }

        
    } else if(type==='http://sbols.org/v2#ComponentDefinition') {
        view = new ViewComponentDefinition()
    } else if(type==='http://sbols.org/v2#ModuleDefinition') {
        view = new ViewModuleDefinition()
    } else if(type==='http://sbols.org/v2#Sequence') {
        view = new ViewSequence()
    } else if(type==='http://sbols.org/v2#Model') {
        view = new ViewModel()
    } else if(type==='http://sbols.org/v2#Attachment') {
        view = new ViewSBOLAttachment()
    } else if(type==='http://wiki.synbiohub.org/wiki/Terms/synbiohub#Attachment') {
        view = new ViewAttachment()
    
    } else if(type==='http://sbols.org/v2#Implementation'){
        view = new ViewImplementation()

    } else {
        view = new ViewGenericTopLevel()
    }

    await view.prepare(req)

    await view.render(res)
};


