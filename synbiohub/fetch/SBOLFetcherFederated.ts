
import SBOLFetcher from "./SBOLFetcher";

export default class SBOLFetcherFederated extends SBOLFetcher {

    providers:Array<SBOLFetcher>

    constructor(providers:Array<SBOLFetcher>) {

        this.providers = providers

    }

    fetchSBOLSource(type: any, uri: any, graphUri: any) {

        /*
        const { submissionId, version } = splitUri(uri)
        const remoteConfig = config.get('remotes')[submissionId]

        return remoteConfig !== undefined && version === 'current' ?
            remote[remoteConfig.type].fetchSBOLSource(remoteConfig, type, uri) :
            local.fetchSBOLSource(type, uri, graphUri)*/
    }

    fetchSBOLObjectRecursive(sbol: any, type: string, uri: string, graphUri: string) {
        /*

        const { submissionId, version } = splitUri(uri)
        const remoteConfig = config.get('remotes')[submissionId]

        return remoteConfig !== undefined && version === 'current' ?
            remote[remoteConfig.type].fetchSBOLObjectRecursive(remoteConfig, sbol, type, uri) :
            local.fetchSBOLObjectRecursive(sbol, type, uri, graphUri)*/
    }

}

