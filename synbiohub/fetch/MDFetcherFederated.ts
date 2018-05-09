
import MDFetcher from "synbiohub/fetch/MDFetcher";

export default class MDFetcherFederated extends MDFetcher {

    getType(uri: string): Promise<string> {
        throw new Error("Method not implemented.");
    }
    getOwnedBy(uri: string): Promise<string> {
        throw new Error("Method not implemented.");
    }

    fetchers:Array<MDFetcher>

    constructor(fetchers:Array<MDFetcher>) {

        super()

        this.fetchers = fetchers

    }

    async getComponentDefinitionMetadata(uri: string): Promise<any> {
        for(let fetcher of this.fetchers) {
            try {
                return await fetcher.getComponentDefinitionMetadata(uri)
            } catch(e) {
                continue
            }
        }
    }

    async getModuleDefinitionMetadata(uri: string): Promise<any> {
        for(let fetcher of this.fetchers) {
            try {
                return await fetcher.getModuleDefinitionMetadata(uri)
            } catch(e) {
                continue
            }
        }
    }

    async getCollectionMetadata(uri: string): Promise<any> {
        for(let fetcher of this.fetchers) {
            try {
                return await fetcher.getCollectionMetadata(uri)
            } catch(e) {
                continue
            }
        }
    }

    async getCollectionMemberCount(uri: string, search?: string): Promise<number> {

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

    async getContainingCollections(uri: string): Promise<string[]> {

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

    async getCollectionMembers(uri: string, limit?: number, offset?: number, sortColumn?: string, search?: any): Promise<any[]> {

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

    async getSubCollections(uri: string): Promise<string[]> {

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

    async getVersion(uri: string): Promise<string> {
        for(let fetcher of this.fetchers) {
            try {
                return await fetcher.getVersion(uri)
            } catch(e) {
                continue
            }
        }
    }

}
