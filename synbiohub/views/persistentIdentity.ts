
import async = require('async');
import config from 'synbiohub/config';
import pug = require('pug');
import topLevel from './topLevel';
import SBHURI from 'synbiohub/SBHURI';

export default function(req, res) {

    let uri = SBHURI.fromURIOrURL(req.url)

    DefaultMDFetcher.get(req).getVersion(uri).then((result) => {
	
	res.redirect(uri.toURL() + '/' + result)

    }).catch((err) => {

	topLevel(req, res)
        
    })
	
};


