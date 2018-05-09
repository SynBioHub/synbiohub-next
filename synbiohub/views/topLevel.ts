
import async from 'async';
import config from 'synbiohub/config';
import pug from 'pug';
import getUrisFromReq from 'synbiohub/getUrisFromReq';
import DefaultMDFetcher from 'synbiohub/fetch/DefaultMDFetcher';
import ViewCollection from 'synbiohub/views/ViewCollection';
import ViewComponentDefinition from './ViewComponentDefinition';
import ViewModuleDefinition from 'synbiohub/views/ViewModuleDefinition';
import ViewSequence from './ViewSequence';
import ViewModel from './ViewModel';
import ViewSBOLAttachment from './ViewSBOLAttachment';
import ViewAttachment from './ViewAttachment';
import ViewGenericTopLevel from './ViewGenericTopLevel';

export default async function(req, res) {

    const { graphUri, uri, designId } = getUrisFromReq(req);

    let result = await DefaultMDFetcher.get(req).getType(uri)

    console.log(result)

    var view

    if(result==='http://sbols.org/v2#Collection') {
        view = new ViewCollection()
    } else if(result==='http://sbols.org/v2#ComponentDefinition') {
        view = new ViewComponentDefinition()
    } else if(result==='http://sbols.org/v2#ModuleDefinition') {
        view = new ViewModuleDefinition()
    } else if(result==='http://sbols.org/v2#Sequence') {
        view = new ViewSequence()
    } else if(result==='http://sbols.org/v2#Model') {
        view = new ViewModel()
    } else if(result==='http://sbols.org/v2#Attachment') {
        view = new ViewSBOLAttachment()
    } else if(result==='http://wiki.synbiohub.org/wiki/Terms/synbiohub#Attachment') {
        view = new ViewAttachment()
    } else {
        view = new ViewGenericTopLevel()
    }

    await view.prepare(req)

    await view.render(res)
};


