
import SBOLDocument from 'sboljs';
import request from 'request';
import config from './config';
import extend from 'xtend';

export async function getBenchlingJson(remoteConfig, path, qs?):Promise<any> {

    console.log('getBenchlingJson:'+ path)

    var retriesLeft = config.get('benchlingMaxRetries')?config.get('benchlingMaxRetries'):3

    return await attempt()

    async function attempt() {

        return new Promise((resolve, reject) => {

            console.log('getBenchlingJson: ' + remoteConfig.url + path)

            request({
                method: 'get',
                headers: {},
                'auth': {
                    'username': remoteConfig['X-BENCHLING-API-Token']
                },
                qs: qs || {},
                rejectUnauthorized: remoteConfig['rejectUnauthorized'],
                url: remoteConfig.url + path
            }, (err, response, body) => {

                console.log('getBenchlingJson: ' + remoteConfig.url + path + ': response received')

                if (err) {
                    console.log('getBenchlingJson: error')
                    reject(err)
                    return
                }

                if (response.statusCode === 500) {

                    if (--retriesLeft < 0) {

                        reject(new Error('Benchling returned 500 and ran out of retries'))
                        return
                    }

                    console.log('Got a 500; ' + retriesLeft + ' retries left...')

                    setTimeout(() => {
                        resolve(attempt())
                    }, config.get('benchlingRetryDelay'))

                    return
                }

                if (response.statusCode >= 300) {
                    //console.log(body)
                    if (response.body && response.body.error && response.body.error.message) {
                        reject(new Error(response.body.error.message))
                    } else {
                        reject(new Error('HTTP ' + response.statusCode))
                    }
                    return
                }

                console.log('getBenchlingJson: success')
                resolve(JSON.parse(body))
            })

        })

    }

}

export async function postBenchlingJson(remoteConfig, path, postData):Promise<any> {

    console.log('getBenchlingJson:'+ path)

    var retriesLeft = config.get('benchlingMaxRetries')?config.get('benchlingMaxRetries'):3

    return await attempt()

    async function attempt() {


        return new Promise((resolve, reject) => {

            console.log('postBenchlingJson: ' + remoteConfig.url + path)

            request({
                method: 'post',
		'content-type': 'application/json',
                json: postData,
		'auth': {
		    'username': remoteConfig['X-BENCHLING-API-Token']
		},
		rejectUnauthorized: remoteConfig['rejectUnauthorized'],
                url: remoteConfig.url + path
            }, (err, response, body) => {

                console.log('postBenchlingJson: ' + remoteConfig.url + path + ': response received')

                if(err) {
                    console.log('postBenchlingJson: error')
                    reject(err)
                    return
                }

                if(response.statusCode === 500) {

                    if(-- retriesLeft < 0) {

                        reject(new Error('Benchling returned 500 and ran out of retries'))
                        return
                    }

                    console.log('Got a 500; ' + retriesLeft + ' retries left...')

                    setTimeout(() => {
                        resolve(attempt())
                    }, config.get('benchlingRetryDelay'))

                    return
                }

                if(response.statusCode >= 300) {
                    //console.log(JSON.stringify(response))
		    if (response.body && response.body.error && response.body.error.message) {
			reject(new Error(response.body.error.message))
		    } else {
			reject(new Error('HTTP ' + response.statusCode))
		    }
                    return
                }

                console.log('postBenchlingJson: success')
                resolve(body)
            })

        })

    }

}

export async function getPart(remoteConfig, partId) {

    console.log('getPart:'+partId)

    return await getBenchlingJson(remoteConfig, '/sequences/' + partId)

}

export async function getSequence(remoteConfig, partId) {

    console.log('getSequence:'+partId)

    return await getBenchlingJson(remoteConfig, '/sequences/' + partId)

}

export async function createSequence(remoteConfig, sequenceData) {

    console.log('createSequence:'+sequenceData.name)

    return await postBenchlingJson(remoteConfig, '/sequences/', sequenceData)

}

export async function getRootFolderCount(remoteConfig) {

    console.log('getRootFolderCount')

    let folders = await getBenchlingJson(remoteConfig, '/folders/')

    return folders.folders.length

}

export async function getRootFolders(remoteConfig, offset?, limit?) {

    console.log('getRootFolders:' + ' offset='+offset+' limit='+limit)

    offset = offset || 0
    limit = limit || 1000000

    let folders = await getBenchlingJson(remoteConfig, '/folders/')

    if (folders.folders.length > offset + limit) {
        return folders.folders.slice(offset, offset + limit)
    } else {
		return folders.folders.slice(offset, folders.folders.length)
    }

}

export async function getFolderEntryCount(remoteConfig, folderId) {

    console.log('getFolderEntryCount:'+folderId)

    let offset = 0
    let limit = 1000000

    let folder = await getBenchlingJson(remoteConfig, '/folders/' + folderId) // + '/entries?limit='+limit+'&'+'offset='+offset)
    return folder.count

}

export async function getFolderEntries(remoteConfig, folderId, offset, limit) {

    console.log('getFolderEntries:'+folderId)

    offset = offset || 0
    limit = limit || 1000000

    let folder = await getBenchlingJson(remoteConfig, '/folders/' + folderId) // + '/entries?limit='+limit+'&'+'offset='+offset)

    if (folder.sequences.length > offset + limit) {
        return folder.sequences.slice(offset, offset + limit)
    } else {
        return folder.sequences.slice(offset, folder.sequences.length)
    }
}

export async function getFolder(remoteConfig, folderId) {

    console.log('getFolder:'+folderId)

    return await getBenchlingJson(remoteConfig, '/folders/' + folderId)
}



