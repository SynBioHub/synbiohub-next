
import async = require('async');
import config from 'synbiohub/config';
import pug = require('pug');
import getUrisFromReq from 'synbiohub/getUrisFromReq';
import topLevel from './topLevel';
import DefaultMDFetcher from 'synbiohub/fetch/DefaultMDFetcher';

export default function(req, res) {

    const { graphUri, uri, designId, url } = getUrisFromReq(req)

    DefaultMDFetcher.get(req).getVersion(uri).then((result) => {
	
	res.redirect(url + '/' + result)

    }).catch((err) => {

	topLevel(req, res)
        
    })
	
};


