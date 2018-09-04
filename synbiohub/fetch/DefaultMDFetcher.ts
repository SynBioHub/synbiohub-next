
import config from 'synbiohub/config'
import MDFetcherLocal from 'synbiohub/fetch/MDFetcherLocal';
import MDFetcher from 'synbiohub/fetch/MDFetcher';
import MDFetcherICE from './MDFetcherICE';
import MDFetcherFederated from './MDFetcherFederated';

export default class DefaultMDFetcher {

    static get(req:any) {

        let fetchers:Array<MDFetcher> = []

        fetchers.push(new MDFetcherLocal(config.get('triplestore').defaultGraph))

        if(req && req.user) {
            fetchers.push(new MDFetcherLocal(req.user.graphUri))
        }

        for(let _remote of Object.values(config.get('remotes'))) {

            let remote:any = _remote

            switch(remote.type) {

                case 'ice':
                    fetchers.push(new MDFetcherICE(remote))
                    break
            }
        }

        return new MDFetcherFederated(fetchers)
    }

}
