import pug from 'pug';
import config from 'synbiohub/config';
import loadTemplate from 'synbiohub/loadTemplate';
import db from 'synbiohub/db';
import * as sparql from 'synbiohub/sparql/sparql';
import getGraphUriFromTopLevevlUri from 'synbiohub/getGraphUriFromTopLevelUri';
import sha1 from 'sha1';

export default async function (req, res) {
    let databasePrefix = config.get('databasePrefix');
    let userUri = databasePrefix + 'user/' + req.user.username;
    let values = {
        userUri: userUri
    };

    const sharedCollectionQuery = loadTemplate('./sparql/GetSharedCollection.sparql', values);

    let results = await sparql.queryJson(sharedCollectionQuery, req.user.graphUri)
        
    let objects = await Promise.all(results.map(result => {
        let objectGraph = getGraphUriFromTopLevevlUri(result.object, req.user);
        let queryParameters = {
            uri: result.object
        };

        let metadataQuery = loadTemplate('./sparql/GetTopLevelMetadata.sparql', queryParameters);
        return sparql.queryJson(metadataQuery, objectGraph).then(result => { console.log(result); return result; });
    }))
        
    let collated = [];

    objects.forEach(array  => {
        ;(array as Array<any>).forEach(object => {
            object.uri = object.persistentIdentity + '/' + object.version;
            object.url = '/' + object.uri.toString().replace(databasePrefix, '') + '/' + sha1('synbiohub_' + sha1(object.uri) + config.get('shareLinkSalt')) + '/share';

            delete object.object;
            collated.push(object);
        })
    })
    
    let locals = {
        config: config.get(),
        section: 'shared',
        user: req.user,
        searchResults: collated
    };

    res.send(pug.renderFile('templates/views/shared.jade', locals));
}
