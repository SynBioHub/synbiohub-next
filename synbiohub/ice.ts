
import SBOLDocument = require('sboljs')
import request = require('request-promise')
import config from './config';
import extend = require('xtend')
import serializeSBOL from './serializeSBOL';
import delay = require('timeout-as-promise')

export async function getIceJson(remoteConfig, path, qs?) {

    var retriesLeft = config.get('iceMaxRetries')?config.get('iceMaxRetries'):3

    return await attempt()

    async function attempt() {

        let response = await request({
            method: 'get',
            headers: {
                'X-ICE-API-Token-Client': remoteConfig['X-ICE-API-Token-Client'],
                'X-ICE-API-Token': remoteConfig['X-ICE-API-Token'],
                'X-ICE-API-Token-Owner': remoteConfig['X-ICE-API-Token-Owner'],
            },
            qs: qs || {},
            rejectUnauthorized: remoteConfig['rejectUnauthorized'],
            url: remoteConfig.url + path,
            resolveWithFullResponse: true,
            simple: true
        })

        console.log('getIceJson: ' + remoteConfig.url + path + ': response received')

        if (response.statusCode === 500) {

            if (--retriesLeft < 0)
                throw new Error('ICE returned 500 and ran out of retries')

            console.log('Got a 500; ' + retriesLeft + ' retries left...')

            await delay(config.get('iceRetryDelay'))

            return await attempt()
        }

        if (response.statusCode >= 300)
            throw new Error('HTTP ' + response.statusCode)

        console.log('getIceJson: success ' + remoteConfig.url + path)

        return JSON.parse(response.body)
    }

}

export async function postIceFile(remoteConfig, path, sbol, id) {

    console.log('postIceFile: ' + remoteConfig.url + path)
    console.log('formData: {\"file\": ... ,\"entryRecordId\": ' + id + ', \"entryType\": \"PART\" }')

    let body = await request({
        method: 'post',
        headers: {
            'Content-Type': 'multipart/form-data; charset=UTF-8',
            'X-ICE-API-Token-Client': remoteConfig['X-ICE-API-Token-Client'],
            'X-ICE-API-Token': remoteConfig['X-ICE-API-Token'],
            'X-ICE-API-Token-Owner': remoteConfig['X-ICE-API-Token-Owner'],
        },
        //files: { "file": "/Users/myers/Downloads/BBa_B0015.xml", 'Content-Type': 'multipart/form-data; charset=UTF-8 },
        formData: { "file": serializeSBOL(sbol).toString('utf8'), "entryRecordId": id, "entryType": "PART" },
        rejectUnauthorized: remoteConfig['rejectUnauthorized'],
        url: remoteConfig.url + path
        //url: 'https://httpbin.org/post' 
    })

    console.log('postIceFile: ' + remoteConfig.url + path + ': response received')

    return JSON.parse(body)
}

export async function postIceJson(remoteConfig, path, post) {

    console.log('postIceJson: ' + remoteConfig.url + path)
    console.log('post: ' + JSON.stringify(post))
            
    let body = await request({
        method: 'post',
        headers: {
            'Content-Type': 'application/json',
            'X-ICE-API-Token-Client': remoteConfig['X-ICE-API-Token-Client'],
            'X-ICE-API-Token': remoteConfig['X-ICE-API-Token'],
            'X-ICE-API-Token-Owner': remoteConfig['X-ICE-API-Token-Owner'],
        },
        //files: { "file": "/Users/myers/Downloads/BBa_B0015.xml", 'Content-Type': 'multipart/form-data; charset=UTF-8 },
        json: post,
        rejectUnauthorized: remoteConfig['rejectUnauthorized'],
        url: remoteConfig.url + path
        //url: 'https://httpbin.org/post' 
    })

    console.log('postIceJson: ' + remoteConfig.url + path + ': response received')

    return JSON.stringify(body)
}

export async function getPart(remoteConfig, partId) {

    return await getIceJson(remoteConfig, '/rest/parts/' + partId)

}

export async function createSequence(remoteConfig, sbol, name, description) {

    var part = {
        type: 'PART',
        name: name,
        //alias: String,
        //keywords: String,
        status: 'Complete',
        shortDescription: description,
        longDescription: '',
        //references: String,
        bioSafetyLevel: 0,
        //intellectualProperty: String,
        //links: [String],
        principalInvestigator: remoteConfig['PI'],
        principalInvestigatorEmail: remoteConfig['PIemail'],
        //selectionMarkers: [String],
        fundingSource: '',
        //parameters: [{name: String, value: String}],
    }

    let result:any = await postIceJson(remoteConfig, '/rest/parts', part)

    var id = parseInt(result.id)

    let result2:any = await postIceFile(remoteConfig, '/rest/file/sequence/', sbol, id)

    var entryId = parseInt(result2.entryId)

    var post = {
        type: 'WRITE_ENTRY',
        article: 'GROUP',
        articleId: remoteConfig['groupId']
    }

    return await postIceJson(remoteConfig, '/rest/parts/' + entryId + '/permissions/', post)
}

export async function getSequence(remoteConfig, partNum) {

    console.log('getIceSequence: ' + remoteConfig.url + '/rest/file/' + partNum + '/sequence/sbol2')

    let body = await request({
        method: 'get',
        headers: {
            'X-ICE-API-Token-Client': remoteConfig['X-ICE-API-Token-Client'],
            'X-ICE-API-Token': remoteConfig['X-ICE-API-Token'],
            'X-ICE-API-Token-Owner': remoteConfig['X-ICE-API-Token-Owner'],
        },
        rejectUnauthorized: remoteConfig['rejectUnauthorized'],
        url: remoteConfig.url + '/rest/file/' + partNum + '/sequence/sbol2'
    })

    return await new Promise((resolve, reject) => {

        SBOLDocument.loadRDF(body, (err, sbol) => {

            if (err) {
                console.log('getIceSequence: ERROR ' + err + ' : ' + remoteConfig.url + '/rest/file/' + partNum + '/sequence/sbol2')
                reject(err)
            } else {
                console.log('getIceSequence: success' + ' : ' + remoteConfig.url + '/rest/file/' + partNum + '/sequence/sbol2')
                resolve(sbol)
            }
        })

    })

}

export async function getRootFolderCount(remoteConfig) {

    let folders = await getIceJson(remoteConfig, '/rest/collections/' + remoteConfig.iceCollection + '/folders')

    return folders.length

}

export async function getRootFolders(remoteConfig, offset?:number, limit?:number) {

    offset = offset || 0
    limit = limit || 1000000

    let folders = await getIceJson(remoteConfig, '/rest/collections/' + remoteConfig.iceCollection + '/folders')

    if (folders.length > offset + limit) {
        return folders.slice(offset, offset + limit)
    } else {
        return folders.slice(offset, folders.length)
    }

}

export async function getRootFolderEntryCount(remoteConfig) {

    let folders = await getIceJson(remoteConfig, '/rest/collections/AVAILABLE/entries')

    return folders.resultCount
}

export async function getRootFolderEntries(remoteConfig, offset?, limit?) {

    offset = offset || 0
    limit = limit || 1000000

    let folders = await getIceJson(remoteConfig, '/rest/collections/AVAILABLE/entries?limit='+limit+'&'+'offset='+offset)

    return folders.data
}

export async function getFolderEntryCount(remoteConfig, folderId) {

    let offset = 0
    let limit = 1000000

    let folder = await getIceJson(remoteConfig, '/rest/folders/' + folderId + '/entries?limit='+limit+'&'+'offset='+offset)

    return folder.entries.length
}

export async function getFolderEntries(remoteConfig, folderId, offset?, limit?) {

    offset = offset || 0
    limit = limit || 1000000

    let folder = await getIceJson(remoteConfig, '/rest/folders/' + folderId + '/entries?limit='+limit+'&'+'offset='+offset)

    return folder.entries
}

export async function getFolder(remoteConfig, folderId) {

    return await getIceJson(remoteConfig, '/rest/folders/' + folderId)
        
}

