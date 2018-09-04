
import SBOLFetcher, { FetchResult } from "./SBOLFetcher";
import { SBOL2Graph } from "sbolgraph";
import SBHURI from "synbiohub/SBHURI";

export default class SBOLFetcherFederated extends SBOLFetcher {

    fetchers:Array<SBOLFetcher>

    constructor(fetchers:Array<SBOLFetcher>) {

        super()

        this.fetchers = fetchers

    }

    async fetchSBOLSource(uri:SBHURI, type?:string):Promise<string> {

        for(let fetcher of this.fetchers) {

            try {

                let tempFilename = await fetcher.fetchSBOLSource(uri, type)

                return tempFilename

            } catch(e) {
                continue
            }
        }
    }

    async fetchSBOLObjectRecursive(uri: SBHURI, type?:string, intoGraph?:SBOL2Graph):Promise<FetchResult> {

        let errors = []

        for(let fetcher of this.fetchers) {

            try {

                let res = await fetcher.fetchSBOLObjectRecursive(uri, type, intoGraph)

                return res

            } catch(e) {
                if(e.name === 'NotFound') {
                    continue
                } else {
                    throw e
                }
            }
        }

        throw new Error('None of the fetchers could get me any SBOL!')

    }

}

