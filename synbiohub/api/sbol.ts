
import pug = require('pug');
import serializeSBOL from 'synbiohub/serializeSBOL';
import config from 'synbiohub/config';
import * as fs from 'mz/fs';
import DefaultSBOLFetcher from 'synbiohub/fetch/DefaultSBOLFetcher';
import SBHURI from 'synbiohub/SBHURI';

export default async function(req, res) {

    req.setTimeout(0) // no timeout

    const uri = SBHURI.fromURIOrURL(req.url)
	
    let tempFilename = await DefaultSBOLFetcher.get(req).fetchSBOLSource(uri)

    res.status(200).type('application/rdf+xml')
        //.set({ 'Content-Disposition': 'attachment; filename=' + collection.name + '.xml' })

    const readStream = fs.createReadStream(tempFilename)
        
    readStream.pipe(res).on('finish', () => {
        fs.unlink(tempFilename)
    })
};


