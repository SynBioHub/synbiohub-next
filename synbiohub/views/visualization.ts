
import fetchSBOLObjectRecursive from 'synbiohub/fetch/fetch-sbol-object-recursive';
import { getComponentDefinitionMetadata } from 'synbiohub/query/component-definition';
import getContainingCollections from 'synbiohub/query/local/collection';
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

export default async function (req, res) {

    var locals = {
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
    } = getUrisFromReq(req, res)

    var templateParams = {
        uri: uri
    }

    let result = await fetchSBOLObjectRecursive('ComponentDefinition', uri, graphUri)

    let sbol = result.sbol
    let componentDefinition = result.object

    locals.meta = {
        displayList: getDisplayList(componentDefinition, config, req.url.toString().endsWith('/share'))
    }

    res.send(pug.renderFile('templates/views/visualization.jade', locals))
};
