
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
import ViewExperiment from './ViewExperiment';
import SBHURI from 'synbiohub/SBHURI';
import { SBOL2Graph, S2Identified } from 'sbolgraph';
import Datastores from '../datastore/Datastores';
import { Types } from 'bioterms';
import dispatchToView from './dispatchToView';
import View404 from 'synbiohub/views/View404';
import ViewAddExperimentToProject from './ViewAddExperimentToProject';

var sparql = require('../sparql/sparql')

export default async function(req, res) {

    let uri:SBHURI = SBHURI.fromURIOrURL(req.url)

    let datastore = Datastores.forSBHURI(uri)
    let graph:SBOL2Graph = new SBOL2Graph()
    await datastore.fetchMetadata(graph, new S2Identified(graph, uri.toURI()))

    let types:Array<string> = graph.getTypes(uri.toURI())

    if(types.length === 0) {
        return dispatchToView(View404)(req, res)
    }

    var view

    if(types.indexOf('http://sbols.org/v2#Collection') !== -1) {

        let test_query = "PREFIX sbh: <http://wiki.synbiohub.org/wiki/Terms/synbiohub#> SELECT ?o WHERE {<" + uri +  "> sbh:Test ?o}"

        let result = await sparql.queryJson(test_query, uri.getGraph())

        if (result.length === 1){
            view = new ViewExperiment()
        }

        else{
            view = new ViewCollection()

        }

        
    } else if(types.indexOf('http://sbols.org/v2#ComponentDefinition') !== -1) {
        view = new ViewComponentDefinition()
    } else if(types.indexOf('http://sbols.org/v2#ModuleDefinition') !== -1) {
        view = new ViewModuleDefinition()
    } else if(types.indexOf('http://sbols.org/v2#Sequence') !== -1) {
        view = new ViewSequence()
    } else if(types.indexOf('http://sbols.org/v2#Model') !== -1) {
        view = new ViewModel()
    } else if(types.indexOf('http://sbols.org/v2#Attachment') !== -1) {
        view = new ViewSBOLAttachment()
    } else if(types.indexOf('http://wiki.synbiohub.org/wiki/Terms/synbiohub#Attachment') !== -1) {
        view = new ViewAttachment()
    } else if(types.indexOf('http://sbols.org/v2#Implementation') !== -1){
        view = new ViewImplementation()
    } else if(types.indexOf('http://sbols.org/v2#Experiment') !== -1){
        view = new ViewExperiment()

    } else {
        view = new ViewGenericTopLevel()
    }

    await view.prepare(req)

    await view.render(res)
};


