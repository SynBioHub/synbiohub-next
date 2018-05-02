
import loadTemplate from 'synbiohub/loadTemplate';
import * as sparql from 'synbiohub/sparql/sparql';
import compareMavenVersions from 'synbiohub/compareMavenVersions';

export default async function getVersion(uri, graphUri) {

    var query = loadTemplate('./sparql/GetVersions.sparql', {
        uri: uri
    })

    let results = await sparql.queryJson(query, graphUri)

    if(results && results[0]) {

        const sortedVersions = results.sort((a, b) => {

            return compareMavenVersions(a.version, b.version)

        }).reverse()

        return sortedVersions[0].version

    } else {

        throw new Error('not found')

    }
}

