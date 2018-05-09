
import loadTemplate from 'synbiohub/loadTemplate'

var pug = require('pug')

import retrieveCitations from 'synbiohub/citations'

var fs = require('mz/fs');

var async = require('async');

var SBOLDocument = require('sboljs')

var extend = require('xtend')

var uuid = require('uuid');

import serializeSBOL from 'synbiohub/serializeSBOL'

var request = require('request')

import config from 'synbiohub/config'

import * as sparql from 'synbiohub/sparql/sparql'

import prepareSubmission from 'synbiohub/prepare-submission'

const tmp = require('tmp-promise')

var collNS = config.get('databasePrefix') + 'public/'

import apiTokens from 'synbiohub/apiTokens'

const sha1 = require("sha1")
import * as attachments from 'synbiohub/attachments'
import uploads from 'synbiohub/uploads'
import DefaultMDFetcher from 'synbiohub/fetch/DefaultMDFetcher';

var exec = require('child_process').exec;

import parseForm from 'synbiohub/parseForm'
import OverwriteMerge, { OverwriteMergeOption } from '../OverwriteMerge';
import MDFetcherLocal from '../fetch/MDFetcherLocal';

export default function (req, res) {

    if (req.method === 'POST') {

        submitPost(req, res)

    } else {

        submitForm(req, res, {}, {})

    }
}

async function submitForm(req, res, submissionData, locals) {

    function sortByNames(a, b) {
        if (a.name < b.name) {
            return -1
        } else {
            return 1
        }
    }

    // TODO re-add subcollections
    let rootCollections = await new MDFetcherLocal(req.user.graphUri).getRootCollectionMetadata()

    rootCollections.sort(sortByNames)

    submissionData = extend({
        id: '',
        version: '1',
        name: '',
        description: '',
        citations: '', // comma separated pubmed IDs
        collectionChoices: [],
        overwrite_merge: '0',
        //createdBy: req.url==='/remoteSubmit'?JSON.parse(req.body.user):req.user,
        createdBy: req.user,
        file: '',
    }, submissionData)

    locals = extend({
        config: config.get(),
        section: 'submit',
        user: req.user,
        submission: submissionData,
        rootCollections: rootCollections,
        errors: []
    }, locals)

    res.send(pug.renderFile('templates/views/submit.jade', locals))
}


async function submitPost(req, res) {

    req.setTimeout(0) // no timeout

    var collectionUri
    var collectionId = ''
    var version = ''
    var name = ''
    var description = ''
    var citations = ''

    let { fields, files } = await parseForm(req)

    // TODO: this code is major hack.  Needs to be cleaned up.
    let collectionChoices = fields.collectionChoices
    if (req.forceNoHTML || !req.accepts('text/html')) {
        if (fields.collectionChoices && fields.collectionChoices[0]) {
            collectionChoices = fields.collectionChoices[0].split(',')
        }
    }

    var overwrite_merge:OverwriteMergeOption = OverwriteMerge.fromSubmitFields(fields)

    if (fields.id && fields.id[0]) {
        collectionId = fields.id[0].trim()
    }
    if (fields.version && fields.version[0]) {
        version = fields.version[0].trim()
    }
    if (fields.name && fields.name[0]) {
        name = fields.name[0].trim()
    }
    if (fields.description && fields.description[0]) {
        description = fields.description[0].trim()
    }
    if (fields.citations && fields.citations[0]) {
        citations = fields.citations[0].trim()
    }
    if (fields.rootCollections && fields.rootCollections[0]) {
        collectionUri = fields.rootCollections[0]
    }

    const submissionData = {
        id: collectionId,
        version: version,
        name: name,
        description: description,
        citations: [],
        collectionChoices: collectionChoices || [],
        overwrite_merge: overwrite_merge,
        createdBy: req.user
    }

    var errors = []

    if (submissionData.createdBy === undefined) {
        errors.push('Must be logged in to submit')
    }

    if (overwrite_merge === OverwriteMergeOption.FailIfExists || overwrite_merge === OverwriteMergeOption.OverwriteIfExists) {

        if (submissionData.id === '') {
            errors.push('Please enter an id for your submission')
        }

        const idRegEx = new RegExp('^[a-zA-Z_]+[a-zA-Z0-9_]*$')
        if (!idRegEx.test(submissionData.id)) {
            errors.push('Collection id is invalid. An id is a string of characters that MUST be composed of only alphanumeric or underscore characters and MUST NOT begin with a digit.')
        }

        if (submissionData.version === '') {
            errors.push('Please enter a version for your submission')
        }

        const versionRegEx = /^[0-9]+[a-zA-Z0-9_\\.-]*$/
        if (!versionRegEx.test(submissionData.version)) {
            errors.push('Version is invalid. A version is a string of characters that MUST be composed of only alphanumeric characters, underscores, hyphens, or periods and MUST begin with a digit.')
        }

        if (submissionData.name === '') {
            errors.push('Please enter a name for your submission')
        }

        if (submissionData.description === '') {
            errors.push('Please enter a brief description for your submission')
        }

        collectionUri = config.get('databasePrefix') + 'user/' + encodeURIComponent(submissionData.createdBy.username) + '/' + submissionData.id + '/' + submissionData.id + '_collection' + '/' + submissionData.version

    } else {

        if (!collectionUri || collectionUri === '') {
            if (!submissionData.createdBy.username || !submissionData.id || !submissionData.version) {
                errors.push('Please select a collection to add to')
            } else {
                collectionUri = config.get('databasePrefix') + 'user/' + encodeURIComponent(submissionData.createdBy.username) + '/' + submissionData.id + '/' + submissionData.id + '_collection' + '/' + submissionData.version
                var tempStr = collectionUri.replace(config.get('databasePrefix') + 'user/' + encodeURIComponent(submissionData.createdBy.username) + '/', '')
                collectionId = submissionData.id + '_collection'
                version = submissionData.version
                console.log('collectionId:' + collectionId)
                console.log('version:' + version)
            }
        }
        else {
            var tempStr = collectionUri.replace(config.get('databasePrefix') + 'user/' + encodeURIComponent(submissionData.createdBy.username) + '/', '')
            collectionId = tempStr.substring(0, tempStr.indexOf('/'))
            version = tempStr.replace(collectionId + '/' + collectionId + '_collection/', '')
            console.log('collectionId:' + collectionId)
            console.log('version:' + version)
        }

    }

    if (errors.length > 0) {
        if (req.forceNoHTML || !req.accepts('text/html')) {
            res.status(500).type('text/plain').send(errors)
            return
        } else {
            return submitForm(req, res, submissionData, {
                errors: errors
            })
        }
    }

    if (citations) {
        submissionData.citations = citations.split(',').map(function (pubmedID) {
            return pubmedID.trim();
        }).filter(function (pubmedID) {
            return pubmedID !== '';
        });
    } else {
        submissionData.citations = []
    }

    var graphUri
    var uri

    graphUri = submissionData.createdBy.graphUri

    uri = collectionUri

    let result = await DefaultMDFetcher.get(req).getCollectionMetadata(uri)

    if (!result) {

        console.log('not found')
        if (submissionData.overwrite_merge === OverwriteMergeOption.MergeAndDrop || submissionData.overwrite_merge === OverwriteMergeOption.MergeAndOverwrite) {
            if (req.forceNoHTML || !req.accepts('text/html')) {
                res.status(500).type('text/plain').send('Submission id and version does not exist')
                return
            } else {
                errors.push('Submission id and version does not exist')
                submitForm(req, res, submissionData, {
                    errors: errors
                })
            }
        }
        submissionData.overwrite_merge = OverwriteMergeOption.FailIfExists
        return doSubmission()

    }

    const metaData = result

    var uriPrefix

    if (submissionData.overwrite_merge === OverwriteMergeOption.MergeAndDrop || submissionData.overwrite_merge === OverwriteMergeOption.MergeAndOverwrite) {

        // Merge
        console.log('merge')
        collectionId = metaData.displayId.replace('_collection', '')
        version = metaData.version
        submissionData.name = metaData.name || ''
        submissionData.description = metaData.description || ''

        return doSubmission()

    } else if (submissionData.overwrite_merge === OverwriteMergeOption.OverwriteIfExists) {
        // Overwrite
        console.log('overwrite')
        uriPrefix = uri.substring(0, uri.lastIndexOf('/'))
        uriPrefix = uriPrefix.substring(0, uriPrefix.lastIndexOf('/') + 1)

        let templateParams = {
            collection: uri,
            uriPrefix: uriPrefix,
            version: submissionData.version
        }
        console.log('removing ' + templateParams.uriPrefix)
        var removeQuery = loadTemplate('sparql/removeCollection.sparql', templateParams)

        await sparql.deleteStaggered(removeQuery, graphUri)

        let templateParams2 = {
            uri: uri
        }
        removeQuery = loadTemplate('sparql/remove.sparql', templateParams2)
        await sparql.deleteStaggered(removeQuery, graphUri)

        doSubmission()

    } else {

        // Prevent make public
        console.log('prevent')

        if (req.forceNoHTML || !req.accepts('text/html')) {
            console.log('prevent')
            res.status(500).type('text/plain').send('Submission id and version already in use')
            return
        } else {
            errors.push('Submission id and version already in use')

            submitForm(req, res, submissionData, {
                errors: errors
            })
        }
    }

    async function saveTempFile() {

        if (files.file) {

            return Promise.resolve(files.file[0].path)

        } else {

            let tmpFilename = await tmp.tmpName()

            await fs.writeFile(tmpFilename, fields.file[0])

            return tmpFilename

        }
    }

    async function doSubmission() {

        console.log('-- validating/converting');

        var tmpFile

        let tmpFilename = await saveTempFile()

        console.log('tmpFilename is ' + tmpFilename)
        tmpFile = tmpFilename

        let result = await prepareSubmission(tmpFilename, {
            submit: true,
            uriPrefix: config.get('databasePrefix') + 'user/' + encodeURIComponent(submissionData.createdBy.username) + '/' + collectionId + '/',

            name: name,
            description: description,
            version: version,

            rootCollectionIdentity: config.get('databasePrefix') + 'user/' + encodeURIComponent(submissionData.createdBy.username) + '/' + collectionId + '/' + collectionId + '_collection/' + version,
            newRootCollectionDisplayId: collectionId + '_collection',
            newRootCollectionVersion: version,
            ownedByURI: config.get('databasePrefix') + 'user/' + submissionData.createdBy.username,
            creatorName: submissionData.createdBy.name,
            citationPubmedIDs: submissionData.citations,
            collectionChoices: submissionData.collectionChoices,
            overwrite_merge: overwrite_merge

        })

        const { success, log, errorLog, resultFilename, attachmentFiles, extractDirPath } = result

        console.log(attachmentFiles);

        if (!success) {
            if (req.forceNoHTML || !req.accepts('text/html')) {
                res.status(500).type('text/plain').send(errorLog)
                return
            } else {
                const locals = {
                    config: config.get(),
                    section: 'invalid',
                    user: req.user,
                    errors: [errorLog]
                }

                res.send(pug.renderFile('templates/views/errors/invalid.jade', locals))
                return
            }
        }

        result = await sparql.uploadFile(submissionData.createdBy.graphUri, resultFilename, 'application/rdf+xml')

        let baseURI = config.get('databasePrefix') + 'user/' + encodeURIComponent(submissionData.createdBy.username) + '/' + collectionId;
        let collectionURI = baseURI + '/' + collectionId + '_collection/' + version;

        let sourceQuery = loadTemplate('sparql/GetAttachmentSourceFromTopLevel.sparql', { uri: collectionURI });


        let results = await sparql.queryJson(sourceQuery, submissionData.createdBy.graphUri)

        let sources = {};

        for(let result of results) {

            let filename = result['source'];
            let uri = result['attachment'];

            sources[filename] = uri;
        }

        let filenames = Object.keys(attachmentFiles)

        for(let filename of filenames) {

            if (attachmentFiles[filename] && attachmentFiles[filename].toLowerCase().indexOf("sbol") >= 0)
                return Promise.resolve()

            let fileStream = fs.createReadStream(filename);

            let uploadInfo = await uploads.createUpload(fileStream)

            const { hash, size, mime } = uploadInfo;

            let originalFilename = filename;

            if(filename.indexOf("/") >= 0) {
                filename = filename.substr(filename.lastIndexOf('/') + 1);
            }

            var key = 'file:'+filename

            if (sources[key]) {
                return attachments.updateAttachment(
                    submissionData.createdBy.graphUri,
                    sources[key],
                    hash,
                    size)
            }

            let attachmentUri = await attachments.addAttachmentToTopLevel(
                submissionData.createdBy.graphUri,
                baseURI,
                collectionURI,
                filename,
                hash,
                size,
                attachmentFiles[originalFilename] || mime,
                submissionData.createdBy.username
            )

            let badFileUri = "file:" + filename;
            let goodFileUri = attachmentUri

            let query = loadTemplate('./sparql/AttachmentUpdate.sparql', { oldUri: badFileUri, newUri: goodFileUri })
            return sparql.updateQuery(query, submissionData.createdBy.graphUri)

        }

        console.log('rm -r ' + extractDirPath)
        exec('rm -r ' + extractDirPath)

        console.log("unlinking:" + tmpFile)
        fs.unlink(tmpFile)
        console.log("unlinking:" + resultFilename)
        fs.unlink(resultFilename)
        if (req.forceNoHTML || !req.accepts('text/html')) {
            res.status(200).type('text/plain').send('Successfully uploaded')
        } else {
            res.redirect('/manage')
        }
    }

}

