
import pug from 'pug';
import loadTemplate from 'synbiohub/loadTemplate';
import getUrisFromReq from 'synbiohub/getUrisFromReq';
import config from 'synbiohub/config';
import getGraphUriFromTopLevelUri from 'synbiohub/getGraphUriFromTopLevelUri';
import multiparty from 'multiparty';
import uploads from 'synbiohub/uploads';
import * as attachments from 'synbiohub/attachments';
import streamToString from 'stream-to-string';
import SBOLDocument from 'sboljs';
import * as sparql from 'synbiohub/sparql/sparql-collate';
import { getAttachmentsForSubject } from 'synbiohub/attachments'
import DefaultMDFetcher from 'synbiohub/fetch/DefaultMDFetcher';

export default async function (req, res) {

	var attachmentObjects = []

	const form = new multiparty.Form()

	const { graphUri, uri, designId, share, url, baseUri } = getUrisFromReq(req)

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
			graphUri, baseUri, uri, partStream.filename, hash, size,
			mime, req.user.username)

			var templateParams = {
				uri: uri
			}

		let attachmentObjects = await getAttachmentsForSubject(uri, graphUri)

		const locals = {
			config: config.get(),
			canEdit: true,
			url: url,
			attachments: attachmentObjects
		}

		res.send(pug.renderFile('templates/partials/attachments.jade', locals))
	})

	form.on('error', (err) => {
		throw err
	})

	form.parse(req)
};


