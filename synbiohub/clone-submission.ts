
import java from './java';
import extend from 'xtend';
import config from './config';

async function cloneSubmission(inFilename, opts) {

    opts = extend({

        sbolFilename: inFilename,
        databasePrefix: config.get('databasePrefix'),
        uriPrefix: 'http://some_uri_prefix/',
        requireComplete: config.get('requireComplete'),
        requireCompliant: config.get('requireCompliant'),
        enforceBestPractices: config.get('requireBestPractice'),
        typesInURI: false,
        version: '1',
        keepGoing: true,
        topLevelURI: '',

	rootCollectionIdentity: '',
        originalCollectionDisplayId: '',
        originalCollectionVersion: '',
        newRootCollectionDisplayId: '',
	newRootCollectionVersion: '',
	webOfRegistries: config.get('webOfRegistries'),
	shareLinkSalt: config.get('shareLinkSalt'),

	overwrite_merge: ''

    }, opts)

    let result:any = await java('cloneSubmission', opts)

    return {
        success: result.success,
        log: result.log,
        errorLog: result.errorLog,
        resultFilename: result.resultFiename
    }
}

export default cloneSubmission;


