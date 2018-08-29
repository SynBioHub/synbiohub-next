
import MDFetcher from "synbiohub/fetch/MDFetcher";
import SBHURI from "synbiohub/SBHURI";

export default class MDFetcherFederated extends MDFetcher {

    fetchers:Array<MDFetcher>

    constructor(fetchers:Array<MDFetcher>) {

        super()

        this.fetchers = fetchers

    }

    async getType(uri: SBHURI): Promise<string> {
        for(let fetcher of this.fetchers) {
            try {
                return await fetcher.getType(uri)
            } catch(e) {
                continue
            }
        }
    }

    async getOwnedBy(uri: SBHURI): Promise<string> {
        for(let fetcher of this.fetchers) {
            try {
                return await fetcher.getOwnedBy(uri)
            } catch(e) {
                continue
            }
        }
    }

    async getComponentDefinitionMetadata(uri: SBHURI): Promise<any> {
        for(let fetcher of this.fetchers) {
            try {
                return await fetcher.getComponentDefinitionMetadata(uri)
            } catch(e) {
                continue
            }
        }
    }

    async getModuleDefinitionMetadata(uri: SBHURI): Promise<any> {
        for(let fetcher of this.fetchers) {
            try {
                return await fetcher.getModuleDefinitionMetadata(uri)
            } catch(e) {
                continue
            }
        }
    }

    async getCollectionMetadata(uri: SBHURI): Promise<any> {
        for(let fetcher of this.fetchers) {
            try {
                return await fetcher.getCollectionMetadata(uri)
            } catch(e) {
                continue
            }
        }
    }

    async getCollectionMemberCount(uri: SBHURI, search?: string): Promise<number> {

        let count = 0

        for(let fetcher of this.fetchers) {
            try {
                count += await fetcher.getCollectionMemberCount(uri)
            } catch(e) {
                continue
            }
        }

        return count
    }

    async getRootCollectionMetadata(): Promise<any[]> {

        let collections = []

        for(let fetcher of this.fetchers) {
            try {
                collections = collections.concat(await fetcher.getRootCollectionMetadata())
            } catch(e) {
                continue
            }
        }

        return collections
    }

    async getContainingCollections(uri: SBHURI): Promise<any[]> {

        let collections = []

        for(let fetcher of this.fetchers) {
            try {
                collections = collections.concat(await fetcher.getContainingCollections(uri))
            } catch(e) {
                continue
            }
        }

        return collections
    }

    async getCollectionMembers(uri: SBHURI, limit?: number, offset?: number, sortColumn?: string, search?: any): Promise<any[]> {

        let members = []

        for(let fetcher of this.fetchers) {
            try {
                members = members.concat(await fetcher.getCollectionMembers(uri, limit, offset, sortColumn, search))
            } catch(e) {
                continue
            }
        }

        return members
    }

    async getSubCollections(uri: SBHURI): Promise<string[]> {

        let collections = []

        for(let fetcher of this.fetchers) {
            try {
                collections = collections.concat(await fetcher.getSubCollections(uri))
            } catch(e) {
                continue
            }
        }

        return collections
    }

    async getCount(type: string): Promise<any> {

        let count = 0

        for(let fetcher of this.fetchers) {
            try {
                count += await fetcher.getCount(type)
            } catch(e) {
                continue
            }
        }

        return count
    }

    async getVersion(uri: SBHURI): Promise<string> {
        for(let fetcher of this.fetchers) {
            try {
                return await fetcher.getVersion(uri)
            } catch(e) {
                continue
            }
        }
    }

    async getName(uri: SBHURI): Promise<string> {
        for(let fetcher of this.fetchers) {
            try {
                return await fetcher.getName(uri)
            } catch(e) {
                continue
            }
        }
    }

}
