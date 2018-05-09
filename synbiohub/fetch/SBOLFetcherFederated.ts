
import SBOLFetcher from "./SBOLFetcher";

export default class SBOLFetcherFederated extends SBOLFetcher {

    fetchers:Array<SBOLFetcher>

    constructor(fetchers:Array<SBOLFetcher>) {

        super()

        this.fetchers = fetchers

    }

    async fetchSBOLSource(type:string, uri:string):Promise<string> {

        for(let fetcher of this.fetchers) {

            try {

                let tempFilename = await fetcher.fetchSBOLSource(type, uri)

                return tempFilename

            } catch(e) {
                continue
            }
        }
    }

    async fetchSBOLObjectRecursive(sbol: any, type: string, uri: string):Promise<any> {

        for(let fetcher of this.fetchers) {

            try {

                let res = await fetcher.fetchSBOLObjectRecursive(sbol, type, uri)

                return res

            } catch(e) {
                continue
            }
        }

    }

}

