
import extend = require('xtend')
import config from 'synbiohub/config';
import validator = require('validator')
import createUser from 'synbiohub/createUser';
import uuid = require('uuid/v4')
import * as theme from 'synbiohub/theme';
import * as fs from 'mz/fs';

export default function (req, res) {

    if (config.get('firstLaunch') !== true) {
        res.status(500).send('Setup is already complete')
        return
    }

    var settings = {
        instanceName: 'My SynBioHub',
        instanceUrl: req.protocol + '://' + req.get('Host') + '/',
        userName: '',
        affiliation: '',
        userFullName: '',
        userEmail: '',
        color: '#D25627'
    }

    if (req.method === 'POST') {
        setupPost(req, res, settings)
    } else {
        setupForm(req, res, settings, {})
    }
};


async function setupForm(req, res, settings, locals) {

    locals = extend({
        config: config.get(),
        title: 'First Time Setup - SynBioHub',
        settings: settings,
        errors: []
    }, locals)

    res.render('templates/views/setup.jade', locals)

}

async function setupPost(req, res, settings) {

    var errors = []

    settings = extend(settings, {
        instanceName: trim(req.body.instanceName),
        instanceUrl: trim(req.body.instanceURL),
        userName: trim(req.body.userName),
        affiliation: trim(req.body.affiliation),
        userFullName: trim(req.body.userFullName),
        userEmail: trim(req.body.userEmail),
        color: trim(req.body.color),
        userPassword: req.body.userPassword,
        userPasswordConfirm: req.body.userPasswordConfirm,
        frontPageText: trim(req.body.frontPageText),
        virtuosoINI: trim(req.body.virtuosoINI),
        virtuosoDB: trim(req.body.virtuosoDB),
        allowPublicSignup: req.body.allowPublicSignup ? true : false
    })

    if (settings.instanceName === '') {
        errors.push('Please enter a name for your SynBioHub instance')
    }

    if (settings.userName === '') {
        errors.push('Please enter a username for the initial user account')
    }

    if (!settings.userEmail || !validator.isEmail(settings.userEmail)) {
        errors.push('Please enter a valid e-mail address for the initial user account')
    }

    if (!settings.instanceUrl) {
        errors.push('Please enter the URL of your instance')
    }

    if (settings.instanceUrl[settings.instanceUrl.length - 1] !== '/') {
        settings.instanceUrl += '/'
    }

    if (!settings.frontPageText) {
        errors.push('Please enter some welcome text for your homepage')
    }

    if (settings.userPassword === '') {
        errors.push('Please enter a password for the initial user account')
    } else {
        if (settings.userPassword !== settings.userPasswordConfirm) {
            errors.push('Passwords did not match')
        }
    }

    if(!settings.virtuosoINI) {
        errors.push('Please enter your virtuoso INI location')
    }

    if(!settings.virtuosoDB) {
        errors.push('Please enter your virtuoso DB location')
    }

    if(errors.length > 0) {

        return setupForm(req, res, settings, {
            errors: errors
        })
    }

    if (req.file) {

        const logoFilename = 'logo_uploaded.' + req.file.originalname.split('.')[1]

        fs.writeFileSync('public/' + logoFilename, req.file.buffer)

        config.set('instanceLogo', '/' + logoFilename)
    }

    config.set('instanceName', settings.instanceName)
    config.set('sessionSecret', uuid())
    config.set('shareLinkSalt', uuid())
    config.set('passwordSalt', uuid())
    config.set('instanceUrl', settings.instanceUrl)
    config.set('webOfRegistries', {[settings.instanceUrl]: settings.instanceUrl})
    config.set('databasePrefix', settings.instanceUrl)
    config.set('themeParameters', { 'default': { baseColor: settings.color } })
    config.set('frontPageText', settings.frontPageText)
    config.set('allowPublicSignup', settings.allowPublicSignup)

    config.set('triplestore', extend(config.get('triplestore'), {
        graphPrefix: settings.instanceUrl,
        defaultGraph: settings.instanceUrl + 'public',
        virtuosoINI: settings.virtuosoINI,
        virtuosoDB: settings.virtuosoDB
    }))


    let user = await createUser({

        username: settings.userName,
        name: settings.userFullName,
        email: settings.userEmail,
        affiliation: settings.affiliation || '',
        password: settings.userPassword,
        isAdmin: true,
        isCurator: true,
        isMember: true

    })

    config.set('firstLaunch', false)

    req.session.user = user.id

    await theme.setCurrentThemeFromConfig()

    req.session.save(() => {
        res.redirect(req.body.next || '/');
    })
}

function trim(input) {

    return input ? input.trim() : ''

}



