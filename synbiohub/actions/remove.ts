import async from 'async';
import request from 'request';
import loadTemplate from 'synbiohub/loadTemplate';
import config from 'synbiohub/config';
import getUrisFromReq from 'synbiohub/getUrisFromReq';
import * as sparql from 'synbiohub/sparql/sparql';
import pug from 'pug';
import DefaultMDFetcher from 'synbiohub/fetch/DefaultMDFetcher';

export default async function(req, res) {

    req.setTimeout(0) // no timeout

    const { graphUri, uri, designId, edit } = getUrisFromReq(req)

    var uriPrefix = uri.substring(0,uri.lastIndexOf('/')+1)

    var templateParams = {
	uri: uri
    }

    var removeQuery = loadTemplate('sparql/remove.sparql', templateParams)

    var type = await DefaultMDFetcher.get(req).getType(uri)

    if (type == 'http://sbols.org/v2#Implementation'){

      var removeQuery = loadTemplate('sparql/removeImplementation.sparql', templateParams)
    }

    var ownedBy = await DefaultMDFetcher.get(req).getOwnedBy(uri)

    if(!edit && (!req.user || !req.user.username ||
      ownedBy.indexOf(config.get('databasePrefix') + 'user/' + req.user.username) === -1)) {
        console.log('not authorized')
        //res.status(401).send('not authorized to edit this submission')
        if (!req.accepts('text/html')) {
          res.status(500).type('text/plain').send('Not authorized to remove this submission')
          return
        }  else {
          const locals = {
            config: config.get(),
            section: 'errors',
            user: req.user,
            errors: [ 'Not authorized to remove this submission' ]
          }
          res.send(pug.renderFile('templates/views/errors/errors.jade', locals))
        }
          }

  await sparql.deleteStaggered(removeQuery, graphUri)

  var templateParams = {
    uri: uri,
  }

  removeQuery = loadTemplate('sparql/removeReferences.sparql', templateParams)

  await sparql.deleteStaggered(removeQuery, graphUri)

  res.redirect('/manage');

  };
