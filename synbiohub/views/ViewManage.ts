
import pug = require('pug');
import * as search from 'synbiohub/search';
import async = require('async');
import config from 'synbiohub/config';
import View from 'synbiohub/views/View';
import { SBHRequest } from 'synbiohub/SBHRequest';
import { Response } from 'express'

export default class ViewManage extends View {

    privateSubmissions: any[]
    publicSubmissions: any[]
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

                this.publicSubmissions = results.map((result) => {

                    result.triplestore = 'public'

                    foundURIs[result.uri] = true

                    return result

                })

            }),

            search.search(req.user.graphUri, criteria, undefined, undefined, req.user).then((searchRes) => {

                const results = searchRes.results

                this.privateSubmissions = results.filter((result) => {
                    
                    return !foundURIs[result.uri]
                    
                }).map((result) => {

                    result.triplestore = 'private'

                    return result

                })

            })

        ])

    }

    async render(res:Response) {

        res.render('templates/views/manage.jade', this)

    }

    private submissionIsPublic(submission) {
        for (var i = 0; i < this.publicSubmissions.length; ++i)
            if (this.publicSubmissions[i].id === submission.id)
                return true;
    }
}





