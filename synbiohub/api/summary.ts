
import pug from 'pug';
import sbolmeta from 'sbolmeta';
import config from 'synbiohub/config';
import getUrisFromReq from 'synbiohub/getUrisFromReq';
import DefaultSBOLFetcher from 'synbiohub/fetch/DefaultSBOLFetcher';

export default async function(req, res) {

    const { graphUri, uri, designId, share } = getUrisFromReq(req)
    
    let result = await DefaultSBOLFetcher.get(req).fetchSBOLObjectRecursive(uri)

    const sbol = result.sbol
    const componentDefinition = result.object

    res.status(200)
        .type('application/json')
        .send(sbol.serializeJSON({
                        'xmlns:synbiohub': 'http://synbiohub.org#',
                        'xmlns:sybio': 'http://www.sybio.ncl.ac.uk#',
                        'xmlns:rdfs': 'http://www.w3.org/2000/01/rdf-schema#',
                        'xmlns:ncbi': 'http://www.ncbi.nlm.nih.gov#',
                        'xmlns:igem': 'http://synbiohub.org/terms/igem/',
                        'xmlns:genbank': 'http://www.ncbi.nlm.nih.gov/genbank/',
                        'xmlns:annot' : 'http://myannotation.org/',
                        'xmlns:pr' : 'http://partsregistry.org/',
                        'xmlns:grn' : 'urn:bbn.com:tasbe:grn/',
                        'xmlns:myapp' : 'http://www.myapp.org/'
        }))
};


