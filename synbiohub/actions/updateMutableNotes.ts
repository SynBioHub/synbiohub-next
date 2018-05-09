
const pug = require('pug')

import * as sparql from 'synbiohub/sparql/sparql'

import loadTemplate from 'synbiohub/loadTemplate'

import config from 'synbiohub/config'

import getGraphUriFromTopLevelUri from 'synbiohub/getGraphUriFromTopLevelUri'

import wiky from 'synbiohub/wiky/wiky'
import DefaultMDFetcher from 'synbiohub/fetch/DefaultMDFetcher';

export default async function(req, res) {

    const uri = req.body.uri

    const graphUri = getGraphUriFromTopLevelUri(uri,req.user)

    const notes = req.body.value

    var notesSparql = ''
    if (notes.trim() != '') {
	notesSparql = '<' + uri + '> sbh:mutableNotes ' + JSON.stringify(notes) + ' .'
    }

    var d = new Date();
    var modified = d.toISOString()
    modified = modified.substring(0,modified.indexOf('.'))

    const updateQuery = loadTemplate('./sparql/UpdateMutableNotes.sparql', {
        topLevel: uri,
        notes: notesSparql,
	modified: JSON.stringify(modified)
    })

    let ownedBy = await DefaultMDFetcher.get(req).getOwnedBy(uri)

    if (ownedBy.indexOf(config.get('databasePrefix') + 'user/' + req.user.username) === -1) {
        res.status(401).send('not authorized to edit this submission')
        return
    }

    let result = await sparql.updateQuery(updateQuery, graphUri)

    const locals = {
        config: config.get(),
        src: notes,
        notes: notes != '' ? wiky.process(notes, {}) : '',
        canEdit: true
    }

    res.send(pug.renderFile('templates/partials/mutable-notes.jade', locals))
}



