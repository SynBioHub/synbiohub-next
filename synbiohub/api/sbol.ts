
import pug from 'pug';
import { fetchSBOLSource } from 'synbiohub/fetch/fetch-sbol-source';
import serializeSBOL from 'synbiohub/serializeSBOL';
import config from 'synbiohub/config';
import getUrisFromReq from 'synbiohub/getUrisFromReq';
import fs from 'mz/fs';

export default async function(req, res) {

    req.setTimeout(0) // no timeout

    const { graphUri, uri, designId, share } = getUrisFromReq(req, res)
	
    let tempFilename = await fetchSBOLSource(uri, graphUri)

    res.status(200).type('application/rdf+xml')
        //.set({ 'Content-Disposition': 'attachment; filename=' + collection.name + '.xml' })

    const readStream = fs.createReadStream(tempFilename)
        
    readStream.pipe(res).on('finish', () => {
        fs.unlink(tempFilename)
    })
};


