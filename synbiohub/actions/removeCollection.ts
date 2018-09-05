import async = require('async');
import request = require('request');
import loadTemplate from 'synbiohub/loadTemplate';
import config from 'synbiohub/config';
import * as sparql from 'synbiohub/sparql/sparql';
import pug = require('pug');
import DefaultMDFetcher from 'synbiohub/fetch/DefaultMDFetcher';
import SBHURI from '../SBHURI';

export default async function(req, res) {

    req.setTimeout(0) // no timeout

    const uri = SBHURI.fromURIOrURL(req.url)

    if (uri.isPublic() && !config.get('removePublicEnabled')) {

        res.status(500).send('Removing public submissions is not allowed')

    }

    var templateParams = {
        collection: uri,
        uriPrefix: uri.getURIPrefix(),
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

    await sparql.deleteStaggered(removeQuery, uri.getGraph())

    let templateParams2 = {
        uri: uri
    }
    removeQuery = loadTemplate('sparql/remove.sparql', templateParams2)

    await sparql.deleteStaggered(removeQuery, uri.getGraph())
    
    res.redirect('/manage');

};
    