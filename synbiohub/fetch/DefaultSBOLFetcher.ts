
import SBOLFetcher from "./SBOLFetcher";
import SBOLFetcherFederated from "./SBOLFetcherFederated";

import config from 'synbiohub/config'
import SBOLFetcherLocal from "./SBOLFetcherLocal";
import SBOLFetcherICE from "./SBOLFetcherICE";
import SBOLFetcherBenchling from "./SBOLFetcherBenchling";

export default class DefaultSBOLFetcher {

    static get(req:any) {

        let fetchers:Array<SBOLFetcher> = []

        fetchers.push(new SBOLFetcherLocal(config.get('triplestore').defaultGraph))

        if(req && req.user) {
            fetchers.push(new SBOLFetcherLocal(req.user.graphUri))
        }

        for(let _remote of Object.values(config.get('remotes'))) {

            let remote:any = _remote

            switch(remote.type) {

                case 'ice':
                    fetchers.push(new SBOLFetcherICE(remote))
                    break

                case 'benchling':
                    fetchers.push(new SBOLFetcherBenchling(remote))
                    break
            }
        }

        return new SBOLFetcherFederated(fetchers)
    }

}
