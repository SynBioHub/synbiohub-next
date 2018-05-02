
import * as sparql from 'synbiohub/sparql/sparql'
import loadTemplate from 'synbiohub/loadTemplate'
import config from 'synbiohub/config'

export default async function getComponentDefinitionMetadata(uri, graphUri) {

    var templateParams = {
        componentDefinition: uri
    }

    var query = loadTemplate('sparql/getComponentDefinitionMetaData.sparql', templateParams)

    graphUri = graphUri || config.get('triplestore').defaultGraph

    let result = await sparql.queryJson(query, graphUri)

    if (result && result[0]) {

        return {
            metaData: result[0],
            graphUri: graphUri
        }

    } else {

        return null

    }

}

