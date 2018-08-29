
import config from 'synbiohub/config';
import request = require('request-promise')
import serializeSBOL from 'synbiohub/serializeSBOL';

async function convertAndValidateSbol(xml:string, uriPrefix, version):Promise<string> {

    let body = await request({
        method: 'POST',
        uri: "http://www.async.ece.utah.edu/validate/",
        'content-type': 'application/json',
        json: { 'options': {
            'language' : 'SBOL2',
            'test_equality': false,
            'check_uri_compliance': config.get('requireCompliant'),
            'check_completeness': config.get('requireComplete'),
            'check_best_practices': config.get('requireBestPractice'),
            'continue_after_first_error': false,
            'provide_detailed_stack_trace': false,
            'subset_uri': '',
            'uri_prefix': uriPrefix,
            'version': version,
            'insert_type': false,
            'main_file_name': 'main file',
            'diff_file_name': 'comparison file',
        },
            'return_file': true,
            'main_file': xml
        }
    })

    if(!body.valid) {

        throw new Error(JSON.stringify(body.errors))

    }

    const convertedSBOL = body.result

    return convertedSBOL
}

export default convertAndValidateSbol;

