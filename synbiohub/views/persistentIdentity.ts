
import async from 'async';
import config from 'synbiohub/config';
import pug from 'pug';
import getUrisFromReq from 'synbiohub/getUrisFromReq';
import topLevel from './topLevel';

export default function(req, res) {

    const { graphUri, uri, designId, url } = getUrisFromReq(req, res)

    getVersion(uri, graphUri).then((result) => {
	
	res.redirect(url + '/' + result)

    }).catch((err) => {

	topLevel(req, res)
        
    })
	
};


