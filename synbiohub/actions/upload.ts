import SBHURI from "../SBHURI";
import { SBOL2Graph, S2Identified, node, S2Collection, S2ComponentDefinition, S2ModuleDefinition, S2Sequence, S2Attachment, S2Implementation, S2Experiment } from "sbolgraph";
import Datastores from "../datastore/Datastores";
import SBOLUploader from "../SBOLUploader";
import { OverwriteMergeOption } from "../OverwriteMerge";
import * as sparql from 'synbiohub/sparql/sparql';
import loadTemplate from "../loadTemplate";
import { Types } from "bioterms";
import S2Model from "sbolgraph/dist/sbol2/S2Model";
import parseForm from 'synbiohub/parseForm'
import { fs } from 'mz';
import uploads from "synbiohub/uploads";
const attachments = require('../attachments')



export default async function (req, res) {

	// TODO reimplement

	var attachmentObjects = []

	let uri:SBHURI = SBHURI.fromURIOrURL(req.url)

	let { fields, files } = await parseForm(req)

	let caption = fields["caption"][0]
	console.log(fields)
	console.log(files)
	let fileStream = await fs.createReadStream(files['file'][0]['path']);
	let uploadInfo = await uploads.createUpload(fileStream)
	const { hash, size, mime } = uploadInfo
	console.log("Created upload!")
	
	await attachments.addAttachmentToTopLevel(
		uri.getGraph(), uri.getURIPrefix(), uri, files['file'][0]['originalFilename'], hash, size,
		mime, req.user.username, caption)

	res.redirect(uri)
	console.log("????????")


	// var done = false

	// form.on('part', async (partStream) => {

	// 	if (!partStream.filename)
	// 		return

	// 	if(done)
	// 		return

	// 	done = true

	// 	// console.log(partStream)
	// 	let uploadInfo = await uploads.createUpload(partStream)
	// 	console.log(JSON.stringify(uploadInfo))
	// 	const { hash, size, mime } = uploadInfo
	// 	console.log("Created upload!")
	// 	console.log(JSON.stringify(uploadInfo))

	// 	await attachments.addAttachmentToTopLevel(
	// 		uri.getGraph(), uri.getURIPrefix(), uri, partStream.filename, hash, size,
	// 		mime, req.user.username)

	// 		var templateParams = {
	// 			uri: uri
	// 		}

	// 	// let attachmentObjects = await getAttachmentsForSubject(uri, uri.getGraph())

	// 	const locals = {
	// 		config: config.get(),
	// 		canEdit: true,
	// 		url: req.url
	// 		// attachments: attachmentObjects
	// 	}


	// 	console.log('hello???')

	// })

	// form.on('error', (err) => {
	// 	throw err
	// })


	// form.parse(req)

	// res.redirect('/projects')
	// res.end()
	// res.send('/projects')

	// const locals = {
	// 	config: config.get(),
	// 	canEdit: true,
	// 	url: req.url
	// 	// attachments: attachmentObjects
	// }
	// res.send(pug.renderFile('templates/partials/attachments.jade', locals))

	// let response:Response
	// response.redirect(uri.getPersistentIdentity() + uri.getVersion())
}


