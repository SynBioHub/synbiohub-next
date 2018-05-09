import async = require('async');
import request = require('request');
import loadTemplate from 'synbiohub/loadTemplate';
import config from 'synbiohub/config';
import getUrisFromReq from 'synbiohub/getUrisFromReq';
import * as sparql from 'synbiohub/sparql/sparql';
import pug = require('pug');
import DefaultMDFetcher from 'synbiohub/fetch/DefaultMDFetcher';

export default async function(req, res) {

    req.setTimeout(0) // no timeout

    const { graphUri, uri, designId } = getUrisFromReq(req)

    if (!graphUri && !config.get('removePublicEnabled')) {

        res.status(500).send('Removing public submissions is not allowed')

    }

    var uriPrefix = uri.substring(0,uri.lastIndexOf('/'))
    uriPrefix = uriPrefix.substring(0,uriPrefix.lastIndexOf('/')+1)

    var templateParams = {
	collection: uri,
        uriPrefix: uriPrefix,
	version: req.params.version
    }

    var removeQuery = loadTemplate('sparql/removeCollection.sparql', templateParams)

    let ownedBy = await DefaultMDFetcher.get(req).getOwnedBy(uri)

    if(ownedBy.indexOf(config.get('databasePrefix') + 'user/' + req.user.username) === -1) {
        //res.status(401).send('not authorized to edit this submission')
    const locals = {
    config: config.get(),
    section: 'errors',
    user: req.user,
    errors: [ 'Not authorized to remove this submission' ]
        }
        res.send(pug.renderFile('templates/views/errors/errors.jade', locals))        
    }

    await sparql.deleteStaggered(removeQuery, graphUri)

    let templateParams2 = {
        uri: uri
    }
    removeQuery = loadTemplate('sparql/remove.sparql', templateParams2)

    await sparql.deleteStaggered(removeQuery, graphUri)
    
    res.redirect('/manage');

};
    