
import pug = require('pug');
import serializeSBOL from 'synbiohub/serializeSBOL';
import config from 'synbiohub/config';
import uploads from 'synbiohub/uploads';
import SBHURI from 'synbiohub/SBHURI';
import { SBOL2Graph, S2Identified, S2Attachment } from 'sbolgraph';
import Datastores from '../datastore/Datastores';

export default async function(req, res) {

    let uri = SBHURI.fromURIOrURL(req.url)
    let datastore = Datastores.forSBHURI(uri)
    let graph = new SBOL2Graph()

    await datastore.fetchMetadata(graph, new S2Identified(graph, uri.toURI()))

    let object:S2Attachment = graph.uriToFacade(uri.toURI()) as S2Attachment

    object = object as S2Attachment

    await datastore.fetchEverything(graph, object)

    let attachmentType = object.format
    let attachmentHash = object.hash

    const readStream = uploads.createCompressedReadStream(attachmentHash)

    const mimeType = config.get('attachmentTypeToMimeType')[attachmentType] || 'application/octet-stream'

    res.status(200)
    res.header('Content-Encoding', 'gzip')
    res.header('Content-Disposition', 'attachment; filename="' + object.displayName + '"')
    res.type(mimeType)
    readStream.pipe(res)

    console.log(res)
};


