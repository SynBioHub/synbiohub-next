
import loadTemplate from 'synbiohub/loadTemplate';
import sbolmeta from 'sbolmeta';
import async from 'async';
import prefixify from 'synbiohub/prefixify';
import pug from 'pug';
import * as sparql from 'synbiohub/sparql/sparql-collate';
import getDisplayList from 'visbol/lib/getDisplayList';
import config from 'synbiohub/config';
import striptags from 'striptags';
import { URI } from 'sboljs';
import getUrisFromReq from 'synbiohub/getUrisFromReq';
import DefaultSBOLFetcher from 'synbiohub/fetch/DefaultSBOLFetcher';

export default async function (req, res) {

    var locals:any = {
        config: config.get(),
        section: 'component',
        user: req.user
    }

    const {
        graphUri,
        uri,
        designId,
        share,
        url
    } = getUrisFromReq(req)

    var templateParams = {
        uri: uri
    }

    let result = await DefaultSBOLFetcher.get(req).fetchSBOLObjectRecursive('ComponentDefinition', uri, graphUri)

    let sbol = result.sbol
    let componentDefinition = result.object

    locals.meta = {
        displayList: getDisplayList(componentDefinition, config, req.url.toString().endsWith('/share'))
    }

    res.send(pug.renderFile('templates/views/visualization.jade', locals))
};
