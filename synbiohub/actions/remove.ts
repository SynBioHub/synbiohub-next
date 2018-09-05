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

    var templateParams = {
      uri: uri
    }

    var removeQuery = loadTemplate('sparql/remove.sparql', templateParams)

    var type = await DefaultMDFetcher.get(req).getType(uri)

    if (type == 'http://sbols.org/v2#Implementation'){

      var removeQuery = loadTemplate('sparql/removeImplementation.sparql', templateParams)
    }

    var ownedBy = await DefaultMDFetcher.get(req).getOwnedBy(uri)


    // TODO THIS NEEDS TO BE FIXED BECAUSE ANYONE CAN DELETE ANYTHING RIGHT NOW
    // if(!edit && (!req.user || !req.user.username ||
    //   ownedBy.indexOf(config.get('databasePrefix') + 'user/' + req.user.username) === -1)) {
    //     console.log('not authorized')
    //     //res.status(401).send('not authorized to edit this submission')
    //     if (!req.accepts('text/html')) {
    //       res.status(500).type('text/plain').send('Not authorized to remove this submission')
    //       return
    //     }  else {
    //       const locals = {
    //         config: config.get(),
    //         section: 'errors',
    //         user: req.user,
    //         errors: [ 'Not authorized to remove this submission' ]
    //       }
    //       res.send(pug.renderFile('templates/views/errors/errors.jade', locals))
    //     }
    //       }

  console.log(removeQuery)
  await sparql.deleteStaggered(removeQuery, uri.getGraph())

  var templateParams = {
    uri: uri,
  }

  removeQuery = loadTemplate('sparql/removeReferences.sparql', templateParams)

  await sparql.deleteStaggered(removeQuery, uri.getGraph())

  res.redirect('/manage');

  };
