
import loadTemplate from 'synbiohub/loadTemplate';
import async = require('async');
import prefixify from 'synbiohub/prefixify';
import pug = require('pug');
import * as sparql from 'synbiohub/sparql/sparql-collate';
import getDisplayList from 'visbol/lib/getDisplayList';
import config from 'synbiohub/config';
import striptags = require('striptags');
import DefaultSBOLFetcher from 'synbiohub/fetch/DefaultSBOLFetcher';
import SBHURI from '../SBHURI';

export default async function (req, res) {

    var locals:any = {
        config: config.get(),
        section: 'component',
        user: req.user
    }

    let uri = SBHURI.fromURIOrURL(req.url)

    var templateParams = {
        uri: uri
    }

    // TODO ignores graphUri
    let result = await DefaultSBOLFetcher.get(req).fetchSBOLObjectRecursive(uri, 'ComponentDefinition')

    let sbol = result.sbol
    let componentDefinition = result.object

    locals.meta = {
        displayList: getDisplayList(componentDefinition, config, req.url.toString().endsWith('/share'))
    }

    res.send(pug.renderFile('templates/views/visualization.jade', locals))
};
