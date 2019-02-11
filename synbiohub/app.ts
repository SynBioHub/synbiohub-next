
import express = require('express')
import session = require('express-session')
import cookieParser = require('cookie-parser')
import bodyParser = require('body-parser')
import multer = require('multer')
import lessMiddleware = require('less-middleware')
import browserifyMiddleware = require('browserify-middleware')
import UglifyJS = require('uglify-es')



// console.log(organisms['Pseudomonas sp. DP-3'])
import { Router, Application } from 'express'

import config from './config';
import SequelizeStoreFactory = require('connect-sequelize')
const SequelizeStore = SequelizeStoreFactory(session);
import db from './db';
import { initSSE } from './sse';
import cache from './cache';
import apiTokens from './apiTokens';
import ViewIndex from './views/ViewIndex';
import logout from './actions/logout';
import register from './views/register';
import viewResetPassword from './views/resetPassword';
import viewEditProfile from './views/editProfile';
import topLevel from './views/topLevel';
import persistentIdentityView from './views/persistentIdentity';
import setup from './views/setup';
import addOwner from './views/addOwner';
import visualization from './views/visualization';
import editProfile from './views/editProfile';
import general from './views/admin/general';
import status from './views/admin/status';
import graphs from './views/admin/graphs';
import sparqlAdmin from './views/admin/sparql';
import remotes from './views/admin/remotes';
import users from './views/admin/users';
import newUser from './views/admin/newUser';
import update from './views/admin/update';
import theme from './views/admin/theme';
import backup from './views/admin/backup';
import backupRestore from './views/admin/backupRestore';
import registries from './views/admin/registries';
import mail from './views/admin/mail';
import ViewAddConstructToProject from './views/ViewAddConstructToProject';
import createTest from './views/ViewAddExperimentToProject';
import organisms from './loadOrganisms';

import ViewAddDesignToProject from './views/ViewAddDesignToProject'


var views = {
    register,
    resetPassword: viewResetPassword,
    topLevel,
    persistentIdentity: persistentIdentityView,
    setup,
    addOwner,
    visualization,
    createTest,


    editProfile: viewEditProfile,


    admin: {
        general,
        status,
        graphs,
        sparql: sparqlAdmin,
        remotes,
        users,
        newUser,
        update,
        theme,
        backup,
        backupRestore,
        registries,
        mail
    }
}

import sbol from './api/sbol';
import omex from './api/omex';
import persistentIdentity from './api/persistentIdentity';
import summary from './api/summary';
import fasta from './api/fasta';
import genBank from './api/genBank';
import autocomplete from './api/autocomplete';
import count from './api/count';
import rootCollections from './api/rootCollections';
import subCollections from './api/subCollections';
import download from './api/download';
import sparqlApi from './api/sparql';
import updateWebOfRegistries from './api/updateWebOfRegistries';

var api = {
    sbol,
    omex,
    persistentIdentity,
    summary,
    fasta,
    genBank,
    autocomplete,
    count,
    rootCollections,
    subCollections,
    download,
    sparql: sparqlApi,
    updateWebOfRegistries,
    organisms
}

import makePublic from './actions/makePublic';
import copyFromRemote from './actions/copyFromRemote';
import removeCollection from './actions/removeCollection';
import cloneSubmission from './actions/cloneSubmission';
import actionResetPassword from './actions/resetPassword';
import setNewPassword from './actions/setNewPassword';
import updateComment from './actions/updateComment';
import remove from './actions/remove';
import updateMutableDescription from './actions/updateMutableDescription';
import updateMutableNotes from './actions/updateMutableNotes';
import updateMutableSource from './actions/updateMutableSource';
import updateCitations from './actions/updateCitations';
import upload from './actions/upload';
import createSnapshot from './actions/createSnapshot';
import updateCollectionIcon from './actions/updateCollectionIcon';
import removeOwner from './actions/removeOwnedBy';
import saveRemote from './actions/admin/saveRemote';
import saveRegistry from './actions/admin/saveRegistry';
import deleteRegistry from './actions/admin/deleteRegistry';
import deleteRemote from './actions/admin/deleteRemote';
import updateUser from './actions/admin/updateUser';
import deleteUser from './actions/admin/deleteUser';
import federate from './actions/admin/federate';
import retrieve from './actions/admin/retrieveFromWoR';
import setAdministratorEmail from './actions/admin/updateAdministratorEmail';
import dispatchToView from 'synbiohub/views/dispatchToView';
import ViewBrowse from 'synbiohub/views/ViewBrowse';
import ViewSPARQL from 'synbiohub/views/ViewSPARQL';
import ViewSearch from 'synbiohub/views/ViewSearch';
import { SBHRequest } from 'synbiohub/SBHRequest';
import ViewAdvancedSearch from './views/ViewAdvancedSearch';
import ViewLogin from 'synbiohub/views/ViewLogin';
import ViewProjects from 'synbiohub/views/ViewProjects';
import ViewNewProject from 'synbiohub/views/ViewNewProject';
import ViewUserProfile from 'synbiohub/views/ViewUserProfile';
import SBHURI from 'synbiohub/SBHURI';
import ViewCollectionMembersDatatable from './views/ViewCollectionMembersDatatable';
import ViewAddExperimentToProject from './views/ViewAddExperimentToProject';

var actions = {
    logout,
    makePublic,
    copyFromRemote,
    removeCollection,
    cloneSubmission,
    resetPassword: actionResetPassword,
    setNewPassword,
    remove,
    updateMutableDescription,
    updateMutableNotes,
    updateMutableSource,
    updateCitations,
    upload,
    createSnapshot,
    updateCollectionIcon,
    removeOwner,
    updateComment,
    admin: {
        saveRemote,
        saveRegistry,
        deleteRegistry,
        deleteRemote,
        updateUser,
        deleteUser,
        federate,
        retrieve,
        setAdministratorEmail
    }
}

/*
browserifyMiddleware.settings({
    mode: 'production',
    cache: '1 day',
    // debug: false,
    // minify: true,
    // precompile: true,
    postcompile: function(source) {
        console.log("Compiled!")
        return UglifyJS.minify(source).code
    },
})*/



function App() {

    var app:Application = express()


    app.set('view engine', 'pug')
    app.set('views', './')

    app.get('/bundle.js', browserifyMiddleware('./browser/synbiohub.js'))


    app.use(lessMiddleware('public', { /*once: true*/ }))

    app.use(express.static('public'))

    app.use(cookieParser())

    app.use(session({
        secret: config.get('sessionSecret'),
        resave: false,
        saveUninitialized: false,
        store: new SequelizeStore(db.sequelize, {}, 'Session')
    }))

    app.use(bodyParser.urlencoded({
        extended: true
    }))

    app.use(bodyParser.json())

    app.use(function (req, res, next) {

        if (req.url !== '/setup' && config.get('firstLaunch') === true) {

            console.log('redirecting')

            res.redirect('/setup')

        } else {

            next()

        }
    })

    app.use(function (req:SBHRequest, res, next) {

        var userID = req.session.user

        if (userID !== undefined) {

            db.model.User.findById(userID).then((user) => {

                req.user = user

                next()
            })

        } else if (req.get('X-authorization') && req.get('X-authorization')!='') {

	    let expectedPromise = apiTokens.getUserFromToken(req.get('X-authorization'));

	    if (expectedPromise) {
            apiTokens.getUserFromToken(req.get('X-authorization')).then((user) => {
                req.user = user
                next()
            })
	    } else {
		    next()
	    }
	} else {
            next()
        }
    })

    var uploadToMemory = multer({
        storage: multer.memoryStorage({})
    })

    initSSE(app)

    app.get('/', dispatchToView(ViewIndex));

    if (config.get('firstLaunch')) {
        app.get('/setup', views.setup);
        app.post('/setup', uploadToMemory.single('logo'), views.setup);
    }

    app.all('/browse', dispatchToView(ViewBrowse))


    function forceNoHTML(req, res, next) {

        req.forceNoHTML = true

        next()

    }

    app.all('/login', dispatchToView(ViewLogin));
    app.post('/remoteLogin', forceNoHTML, dispatchToView(ViewLogin)); // Deprecated
    app.all('/logout', actions.logout);
    app.all('/register', views.register);
    app.all('/resetPassword/token/:token', actions.resetPassword);
    app.all('/resetPassword', views.resetPassword);
    app.post('/setNewPassword', actions.setNewPassword);
    app.all('/editProfile', requireUser, views.editProfile);

    app.get('/user/:username', dispatchToView(ViewUserProfile))
    //app.get('/org/:orgID', views.orgProfile)

    app.post('/updateMutableDescription', requireUser, actions.updateMutableDescription);
    app.post('/updateMutableNotes', requireUser, actions.updateMutableNotes);
    app.post('/updateMutableSource', requireUser, actions.updateMutableSource);
    app.post('/updateCitations', requireUser, actions.updateCitations);

    app.get('/metadataDownload', function(req, res){

        console.log()
        res.download('./MetadataSpreadsheet.ods')
    });

    app.get('/autocomplete/:query', api.autocomplete)
    app.get('/organisms/:query', api.organisms)
    app.get('/projects', requireUser, dispatchToView(ViewProjects))

    app.get('/admin', requireAdmin, views.admin.status);

    // TODO: ???
    app.get('/admin/search/:query?', dispatchToView(ViewSearch))

    app.get('/admin/graphs', requireAdmin, views.admin.graphs);
    app.get('/admin/sparql', requireAdmin, views.admin.sparql);
    app.get('/admin/remotes', requireAdmin, views.admin.remotes);
    app.get('/admin/users', requireAdmin, views.admin.users);
    app.get('/admin/newUser', requireAdmin, views.admin.newUser);
    app.get('/admin/update', requireAdmin, views.admin.update);
    app.get('/admin/theme', requireAdmin, views.admin.theme);
    app.post('/admin/theme', requireAdmin, uploadToMemory.single('logo'), views.admin.theme);
    app.get('/admin/general', requireAdmin, views.admin.general);
    app.post('/admin/general', requireAdmin, bodyParser.urlencoded({ extended: true }), views.admin.general);
    app.get('/admin/backup', requireAdmin, views.admin.backup);
    app.get('/admin/registries', requireAdmin, views.admin.registries);
    app.post('/admin/backup', requireAdmin, bodyParser.urlencoded({ extended: true }), views.admin.backup);
    app.post('/admin/backup/restore/:prefix', requireAdmin, bodyParser.urlencoded({ extended: true }), views.admin.backupRestore);
    app.post('/admin/newUser', requireAdmin, bodyParser.urlencoded({ extended: true }), views.admin.newUser);
    app.post('/admin/updateUser', requireAdmin, bodyParser.urlencoded({ extended: true }), actions.admin.updateUser);
    app.post('/admin/deleteUser', requireAdmin, bodyParser.urlencoded({ extended: true }), actions.admin.deleteUser);
    app.post('/admin/deleteRemote', requireAdmin, bodyParser.urlencoded({ extended: true }), actions.admin.deleteRemote);
    app.post('/admin/saveRemote', requireAdmin, bodyParser.urlencoded({ extended: true }), actions.admin.saveRemote);
    app.post('/admin/saveRegistry', requireAdmin, bodyParser.urlencoded({ extended: true }), actions.admin.saveRegistry);
    app.post('/admin/deleteRegistry', requireAdmin, bodyParser.urlencoded({ extended: true }), actions.admin.deleteRegistry);
    app.get('/admin/mail', requireAdmin, views.admin.mail);
    app.post('/admin/mail', requireAdmin, bodyParser.urlencoded({ extended: true }), views.admin.mail);
    app.post('/admin/setAdministratorEmail', requireAdmin, bodyParser.urlencoded({ extended: true }), actions.admin.setAdministratorEmail);

    app.post('/updateWebOfRegistries', bodyParser.json(), api.updateWebOfRegistries);
    app.post('/admin/federate', requireAdmin, bodyParser.urlencoded({ extended: true }), actions.admin.federate);
    app.post('/admin/retrieveFromWebOfRegistries', requireAdmin, actions.admin.retrieve);

    app.get('/search/:query?', dispatchToView(ViewSearch));
    app.get('/searchCount/:query?', dispatchToView(ViewSearch));
    app.get('/remoteSearch/:query?', forceNoHTML, dispatchToView(ViewSearch)); /// DEPRECATED, use /search
    app.all('/advancedSearch', dispatchToView(ViewAdvancedSearch));
    app.get('/advancedSearch/:query?', dispatchToView(ViewSearch));

    app.get('/createCollection', dispatchToView(ViewAdvancedSearch));
    app.post('/createCollection', dispatchToView(ViewAdvancedSearch));
    app.get('/createCollection/:query?', dispatchToView(ViewSearch));

    app.all('/newProject', dispatchToView(ViewNewProject))

    app.get('/:type/count', api.count)
    app.get('/rootCollections', api.rootCollections)

    app.get('/sparql', dispatchToView(ViewSPARQL))
    app.post('/sparql', bodyParser.urlencoded({ extended: true }), sparql)

    function sparql(req, res) {
        // jena sends accept: */* and then complains when we send HTML
        // back. so only send html if the literal string text/html is present
        // in the accept header.

        let accept = req.header('accept');
        if (accept && accept.indexOf('text/html') !== -1) {
            dispatchToView(ViewSPARQL)(req, res)
        } else {
            api.sparql(req, res)
        }
    }


    app.use(function(req, res, next) {

        if(!req.url.startsWith('/user/') && !req.url.startsWith('/public/')) {
            return next()
        }

        let uri:SBHURI = SBHURI.fromURIOrURL(req.url)

        let extraPart:string|null = uri.getExtraPart()

        if(!extraPart) {

            // Just accessing a toplevel

            return topLevel(req, res)
        }

        let version:string|null = uri.getVersion()

        if(!version) {
            if(extraPart === 'sbol') {
                return api.persistentIdentity(req, res)
            } else {
                return views.persistentIdentity(req, res)
            }
        }

        if(extraPart.startsWith('search/')) {
            return dispatchToView(ViewSearch)(req, res)
        }

        if(extraPart.indexOf('.') !== -1) {
            if(extraPart.endsWith('.xml'))
                return api.sbol(req, res)
            if(extraPart.endsWith('.omex'))
                return api.omex(req, res)
            if(extraPart.endsWith('.summary'))
                return api.summary(req, res)
            if(extraPart.endsWith('.fasta'))
                return api.fasta(req, res)
            if(extraPart.endsWith('.gb'))
                return api.genBank(req, res)
        }

        if(uri.isPublic()) {

            // Public only endpoints
            // TODO: need to decide if createSnapshot is functional and should be kept or not

            switch(extraPart) {
            case 'copyFromRemote':
                return chain(req, res, requireUser, actions.copyFromRemote)
            case 'createSnapshot':
                return requireUser(req, res, actions.createSnapshot)
            }

        } else {

            // Private only endpoints

            switch(extraPart) {
            case 'makePublic':
                return chain(req, res, requireUser, actions.makePublic)
            }
        }

        // Both public and private endpoints

        console.log('EXTRA PART')
        console.log(extraPart)
        switch(extraPart) {
        case 'addConstruct':
            return chain(req, res, requireUser, dispatchToView(ViewAddConstructToProject))
        case 'addExperiment':
            return chain(req, res, requireUser, dispatchToView(ViewAddExperimentToProject))
        case 'cloneSubmission':
            return chain(req, res, requireUser, actions.cloneSubmission)
        case 'remove':
            return chain(req, res, requireUser, actions.remove)
        case 'createICEPart':
            return chain(req, res, requireUser, actions.createICEPart)
        case 'attach':
            return chain(req, res, requireUser, actions.upload)
        case 'comment':
            return chain(req, res, requireUser, actions.updateComment)
        case 'download':
            return chain(req, res, requireUser, api.download)
        case 'icon':
            return chain(req, res, requireUser, uploadToMemory.single('collectionIcon'), api.download)
        case 'removeCollection':
            return chain(req, res, requireAdmin, actions.removeCollection)
        case 'subCollections':
            return chain(req, res, api.subCollections)
        case 'twins':
            return chain(req, res, dispatchToView(ViewSearch))
        case 'uses':
            return chain(req, res, dispatchToView(ViewSearch))
        case 'addOwner':
            return chain(req, res, requireUser, views.addOwner)
        case 'removeOwner':
            return chain(req, res, requireUser, actions.removeOwner)
        case 'visualization':
            return chain(req, res, requireUser, views.visualization)
        case 'addDesign':
            return chain(req, res, requireUser, dispatchToView(ViewAddDesignToProject))
        case 'datatableCollectionMembers':
            return chain(req, res, dispatchToView(ViewCollectionMembersDatatable))
        }

        next()
    })

    function requireUser(req, res, next) {

        if (req.user === undefined) {
            if (!req.accepts('text/html')) {
		res.status(401).send('Login required')
            } else {
		res.redirect('/login?next=' + encodeURIComponent(req.url))
            }
        } else
            next()
    }

    function requireAdmin(req, res, next) {

        if (req.user === undefined || !req.user.isAdmin)
            if (!req.accepts('text/html')) {
		res.status(401).send('Administrator login required')
            } else {
		res.redirect('/login?next=' + encodeURIComponent(req.url))
            }
        else
            next()
    }

    function chain(req, res, ...fns:any[]) {
        let n = 0
        next()
        function next() {
            fns[n](req, res, () => {
                if(++ n === fns.length)
                    return
                next()
            })
        }
    }

    cache.update()

    return app
}

export default App;
