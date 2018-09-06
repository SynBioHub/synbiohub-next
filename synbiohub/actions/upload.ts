
import pug = require('pug');
import loadTemplate from 'synbiohub/loadTemplate';
import config from 'synbiohub/config';
import multiparty = require('multiparty');
import uploads from 'synbiohub/uploads';
import * as attachments from 'synbiohub/attachments';
import streamToString = require('stream-to-string');
import * as sparql from 'synbiohub/sparql/sparql-collate';
import { getAttachmentsForSubject } from 'synbiohub/attachments'
import SBHURI from 'synbiohub/SBHURI';

export default async function (req, res) {

	// TODO reimplement

	/*

	var attachmentObjects = []

	const form = new multiparty.Form()

	let uri:SBHURI = SBHURI.fromURIOrURL(req.url)

	let ownedBy = await DefaultMDFetcher.get(req).getOwnedBy(uri)

	if (ownedBy.indexOf(config.get('databasePrefix') + 'user/' + req.user.username) === -1) {
		return res.status(401).send('not authorized to edit this submission')
	}

	var done = false

	form.on('part', async (partStream) => {

		if (!partStream.filename)
			return

		if(done)
			return

		done = true

		let uploadInfo = await uploads.createUpload(partStream)
		console.log(JSON.stringify(uploadInfo))
		const { hash, size, mime } = uploadInfo
		console.log("Created upload!")
		console.log(JSON.stringify(uploadInfo))

		await attachments.addAttachmentToTopLevel(
			uri.getGraph(), uri.getURIPrefix(), uri, partStream.filename, hash, size,
			mime, req.user.username)

			var templateParams = {
				uri: uri
			}

		let attachmentObjects = await getAttachmentsForSubject(uri, uri.getGraph())

		const locals = {
			config: config.get(),
			canEdit: true,
			url: req.url,
			attachments: attachmentObjects
		}

		res.send(pug.renderFile('templates/partials/attachments.jade', locals))
	})

	form.on('error', (err) => {
		throw err
	})

	form.parse(req)
	*/
};


