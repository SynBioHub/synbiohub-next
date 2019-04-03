import async = require('async');
import request = require('request');
import loadTemplate from 'synbiohub/loadTemplate';
import config from 'synbiohub/config';
import * as sparql from 'synbiohub/sparql/sparql';
import pug = require('pug');
import SBHURI from '../SBHURI';
import { S1Collection } from 'sbolgraph';

export default async function(req, res) {

    // TODO reimplement


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

    console.log(templateParams['collection'])

    var removeQuery1 = loadTemplate('sparql/removeCollectionContents.sparql', templateParams)
    var removeQuery2 = loadTemplate('sparql/removeProject.sparql', templateParams)

    // let ownedBy = await DefaultMDFetcher.get(req).getOwnedBy(uri)

    // if(ownedBy.indexOf(config.get('databasePrefix') + 'user/' + req.user.username) === -1) {
    //     //res.status(401).send('not authorized to edit this submission')
    // const locals = {
    // config: config.get(),
    // section: 'errors',
    // user: req.user,
    // errors: [ 'Not authorized to remove this submission' ]
    //     }
    //     res.send(pug.renderFile('templates/views/errors/errors.jade', locals))        
    // }

    await sparql.deleteStaggered(removeQuery1, uri.getGraph())
    await sparql.deleteStaggered(removeQuery2, uri.getGraph())


    // let templateParams2 = {
    //     uri: uri
    // }
    // removeQuery = loadTemplate('sparql/remove.sparql', templateParams2)

    // await sparql.deleteStaggered(removeQuery, uri.getGraph())
    
    res.redirect('/projects');

};
    