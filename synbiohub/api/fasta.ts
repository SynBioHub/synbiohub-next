
import async = require('async');
import config from 'synbiohub/config';

//var fastaCollection = require('./fastaCollection')

import fastaComponentDefinition from './fastaComponentDefinition';
import fastaCollection from './fastaCollection';

//var fastaModule = require('./fastaModule')

import fastaSequence from './fastaSequence';

import pug = require('pug');
import DefaultMDFetcher from 'synbiohub/fetch/DefaultMDFetcher';
import SBHURI from '../SBHURI';

export default async function(req, res) {

    const uri = SBHURI.fromURIOrURL(req.url)

    let result = await DefaultMDFetcher.get(req).getType(uri)

    if(result && result==='http://sbols.org/v2#ComponentDefinition') { 
        fastaComponentDefinition(req, res)
        return
    } else if(result && result==='http://sbols.org/v2#Sequence') { 
        fastaSequence(req, res)
        return
    } else if(result && result==='http://sbols.org/v2#Collection') {
        fastaCollection(req, res)
        return
    }
/*
    } else if(result[0] && result[0].type==='http://sbols.org/v2#ModuleDefinition') { 
fastaModuleDefinition(req, res)
return
    } else if(result[0] && result[0].type==='http://sbols.org/v2#Model') { 
fastaModel(req, res)
return
    } else }
fastaGenericTopLevel(req, res)
return
    } */ else {
        let locals = {
            config: config.get(),
            section: 'errors',
            user: req.user,
            errors: [ uri + ' is a ' + result + '.', 
                'FASTA conversion not supported for this type.' ]
        }
        res.send(pug.renderFile('templates/views/errors/errors.jade', locals))
        return
    }
};

