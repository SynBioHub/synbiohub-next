import MDFetcher from "./MDFetcher";

import * as benchling from 'synbiohub/benchling'
import splitUri from "synbiohub/splitUri";
import config from "synbiohub/config";

export default class MDFetcherBenchling extends MDFetcher {

    getOwnedBy(uri: string): Promise<string> {
        throw new Error("Method not implemented.");
    }
    getComponentDefinitionMetadata(uri: string): Promise<any> {
        throw new Error("Method not implemented.");
    }
    getModuleDefinitionMetadata(uri: string): Promise<any> {
        throw new Error("Method not implemented.");
    }
    getCollectionMetadata(uri: string): Promise<any> {
        throw new Error("Method not implemented.");
    }
    getCount(type: string): Promise<any> {
        throw new Error("Method not implemented.");
    }
    getVersion(uri: string): Promise<string> {
        throw new Error("Method not implemented.");
    }


    remoteConfig:any

    constructor(remoteConfig:any) {

        super()

        this.remoteConfig = remoteConfig

    }

    async getCollectionMemberCount(uri) {

        const { displayId } = splitUri(uri)

        if(displayId === this.remoteConfig.rootCollection.displayId) {

            return benchling.getRootFolderCount(this.remoteConfig)

        }

        if(displayId.indexOf(this.remoteConfig.folderPrefix) !== 0) {
            throw new Error('???')
        }

        const folderId = displayId.slice(this.remoteConfig.folderPrefix.length)

        return benchling.getFolderEntryCount(this.remoteConfig, folderId)
    }

    async getRootCollectionMetadata() {

        return [
            {
                uri: config.get('databasePrefix') + 'public/' + this.remoteConfig.id +
                            '/' + this.remoteConfig.rootCollection.displayId
                                + '/current',
                version: 'current',
                name: this.remoteConfig.rootCollection.name,
                displayId: this.remoteConfig.rootCollection.displayId,
                description: this.remoteConfig.rootCollection.description,
                wasDerivedFrom: 'https://benchling.com', //this.remoteConfig.url + '/folders/',
                remote: true
            }
        ]

    }

    async getContainingCollections(uri) {

        var rootUri = config.get('databasePrefix') + 'public/' + this.remoteConfig.id + '/' + this.remoteConfig.id + '_collection/current'
        
        if (uri != rootUri) {
            return [{
                uri: rootUri,
                name: this.remoteConfig.rootCollection.name
            }]
        } else {
            return []
        }

    }


    async getCollectionMembers(uri, limit, offset) {

        const { displayId } = splitUri(uri)

        if(displayId === this.remoteConfig.rootCollection.displayId) {

            let rootFolders = await benchling.getRootFolders(this.remoteConfig, offset, limit)

            return foldersToCollections(rootFolders)

        }

        const folderId = displayId.slice(this.remoteConfig.folderPrefix.length)

        let entries = await benchling.getFolderEntries(this.remoteConfig, folderId, offset, limit)
        let metadata = entriesToMetadata(entries)

        return concatArrays(metadata)


        function concatArrays(arrs) {

            const res = []

            arrs.forEach((arr) => {
                Array.prototype.push.apply(res, arr)
            })

            return res
        }

        function foldersToCollections(folders) {

            return folders.map((folder) => {
                return {
                    type: 'http://sbols.org/v2#Collection',
                    displayId: this.remoteConfig.folderPrefix + folder.id,
                    version: 'current',
                    uri: config.get('databasePrefix') + 'public/' + this.remoteConfig.id + '/' + this.remoteConfig.folderPrefix + folder.id + '/current',
                    name: folder.name,
                    description: folder.description,
                    wasDerivedFrom: 'https://benchling.com', //this.remoteConfig.url + '/folders/' + folder.id,
                    remote: true
                }
            })
        }

        function entriesToMetadata(entries) {

            const version = 'current'

            return entries.map((entry) => {

                const res = [
                    {
                        type: 'http://sbols.org/v2#ComponentDefinition',
                        uri: config.get('databasePrefix') + 'public/' + this.remoteConfig.id + '/' + entry.id + '/' + version,
                        displayId: entry.id,
                        version: version,
                        name: entry.name,
                        description: '',
                        wasDerivedFrom: 'https://benchling.com', //this.remoteConfig.url + '/sequences/' + entry.id,
                        remote: true
                    }
                ]

            // TODO: should we include sequences in the collection list?
                // if(entry.hasSequence) {

                //     res.push({
                //         type: 'http://sbols.org/v2#Sequence',
                //         uri: config.get('databasePrefix') + 'public/' + this.remoteConfig.id + '/' + entry.partId + this.remoteConfig.sequenceSuffix + '/' + version,
                //         displayId: entry.partId + this.remoteConfig.sequenceSuffix,
                //         version: version,
                //         name: entry.name + ' sequence',
                //         description: '',
                //         wasDerivedFrom: this.remoteConfig.url + '/entry/' + entry.partId,
                //         remote: true
                //     })
                // }

                return res
            })

        }

    }

    async getCollectionMetaData(uri) {

        const { displayId } = splitUri(uri)

        if(displayId === this.remoteConfig.rootCollection.displayId) {

            let metadata = await getRootCollectionMetadata(this.remoteConfig)

            return metadata[0]

        }

        const folderId = displayId.slice(this.remoteConfig.folderPrefix.length)

        let folder = await benchling.getFolder(this.remoteConfig, folderId)

        return {
            type: 'http://sbols.org/v2#Collection',
            displayId: this.remoteConfig.folderPrefix + folder.id,
            version: 'current',
            uri: config.get('databasePrefix') + this.remoteConfig.id + '/' + this.remoteConfig.folderPrefix + folder.id + '/current',
            name: folder.name,
            description: folder.description,
            wasDerivedFrom: 'https://benchling.com', //this.remoteConfig.url + '/folders/' + folder.id,
            remote: true
        }

    }

    async getSubCollections(uri) {

        const { displayId } = splitUri(uri)

        if(displayId === this.remoteConfig.rootCollection.displayId) {

            return getCollectionMembers(this.remoteConfig, uri)

        } else {

            return []

        }

    }

    async getType(uri) {

        const { displayId } = splitUri(uri)

        if(displayId === this.remoteConfig.rootCollection.displayId) {

            return 'http://sbols.org/v2#Collection'

        } else if(displayId.indexOf(this.remoteConfig.folderPrefix) === 0) {

            return 'http://sbols.org/v2#Collection'

        } else if(displayId.endsWith(this.remoteConfig.sequenceSuffix)) {

            return 'http://sbols.org/v2#Sequence'

        } else {

            return 'http://sbols.org/v2#ComponentDefinition'

        }

    }

}



