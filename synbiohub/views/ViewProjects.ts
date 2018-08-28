
import pug = require('pug');
import * as search from 'synbiohub/search';
import async = require('async');
import config from 'synbiohub/config';
import View from 'synbiohub/views/View';
import { SBHRequest } from 'synbiohub/SBHRequest';
import { Response } from 'express'
import loadTemplate from 'synbiohub/loadTemplate';
import * as sparql from 'synbiohub/sparql/sparql';
import getGraphUriFromTopLevelUri from 'synbiohub/getGraphUriFromTopLevelUri';
import sha1 = require('sha1')
import uriToUrl from 'synbiohub/uriToUrl';

export default class ViewProjects extends View {

    privateProjects: any[]
    publicProjects: any[]
    sharedProjects:any[]

    removePublicEnabled:boolean

    constructor() {

        super()

        this.removePublicEnabled = config.get('removePublicEnabled')
    }

    async prepare(req:SBHRequest) {

        await super.prepare(req)

        var userCriteria = '{ ?subject synbiohub:uploadedBy "' + req.user.email + '" } UNION { ?subject sbh:ownedBy <' + config.get('databasePrefix') + 'user/' + req.user.username + '> } .'

        if (req.user.isAdmin) {
            userCriteria = '';
        }

        var criteria = [
            '?subject a sbol2:Collection . ' + userCriteria +
            'FILTER NOT EXISTS { ?otherCollection sbol2:member ?subject }'
        ].join('\n')

        var foundURIs = {}

        await Promise.all([

            search.search(null, criteria, undefined, undefined, undefined).then((searchRes) => {

                const results = searchRes.results

                this.publicProjects = results.map((result) => {

                    result.triplestore = 'public'
                    result.url = uriToUrl(result.uri, req)

                    foundURIs[result.uri] = true

                    return result

                })

            }),

            search.search(req.user.graphUri, criteria, undefined, undefined, req.user).then((searchRes) => {

                const results = searchRes.results

                this.privateProjects = results.filter((result) => {
                    
                    return !foundURIs[result.uri]
                    
                }).map((result) => {

                    result.triplestore = 'private'
                    result.url = uriToUrl(result.uri, req)

                    return result

                })

            }),

            this.findSharedWithMe(req)

        ])

    }

    async findSharedWithMe(req:SBHRequest) {

        let databasePrefix = config.get('databasePrefix');
        let userUri = databasePrefix + 'user/' + req.user.username;
        let values = {
            userUri: userUri
        };

        const sharedCollectionQuery = loadTemplate('./sparql/GetSharedCollection.sparql', values);

        let results = await sparql.queryJson(sharedCollectionQuery, req.user.graphUri)
            
        let objects = await Promise.all(results.map(result => {
            let objectGraph = getGraphUriFromTopLevelUri(result.object, req.user);
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

                // TODO wtf is this
                object.url = '/' + object.uri.toString().replace(databasePrefix, '') + '/' + sha1('synbiohub_' + sha1(object.uri) + config.get('shareLinkSalt')) + '/share';

                delete object.object;
                collated.push(object);
            })
        })

        this.sharedProjects = collated
    }

    async render(res:Response) {

        res.render('templates/views/projects.jade', this)

    }

    private projectIsPublic(project) {
        for (var i = 0; i < this.publicProjects.length; ++i)
            if (this.publicProjects[i].id === project.id)
                return true;
    }
}






/*
import pug = require('pug');
import config from 'synbiohub/config';
import loadTemplate from 'synbiohub/loadTemplate';
import db from 'synbiohub/db';
import * as sparql from 'synbiohub/sparql/sparql';
import getGraphUriFromTopLevevlUri from 'synbiohub/getGraphUriFromTopLevelUri';
import sha1 = require('sha1');

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
*/
