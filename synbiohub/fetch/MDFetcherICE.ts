import MDFetcher from "./MDFetcher";

import * as ice from 'synbiohub/ice'
import splitUri from "synbiohub/splitUri";
import config from "synbiohub/config";

export default class MDFetcherICE extends MDFetcher {

    getName(uri: string): Promise<string> {
        throw new Error("Method not implemented.");
    }
    getOwnedBy(uri: string): Promise<string> {
        throw new Error("Method not implemented.");
    }
    getComponentDefinitionMetadata(uri: string): Promise<any> {
        throw new Error("Method not implemented.");
    }
    getModuleDefinitionMetadata(uri: string): Promise<any> {
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

            return ice.getRootFolderCount(this.remoteConfig)

        }

        if(displayId === 'available') {

            return ice.getRootFolderEntryCount(this.remoteConfig)

        }

        if(displayId.indexOf(this.remoteConfig.folderPrefix) !== 0) {

            throw new Error('???')

        }

        const folderId = parseInt(displayId.slice(this.remoteConfig.folderPrefix.length))

        return ice.getFolderEntryCount(this.remoteConfig, folderId)
    }

    async getRootCollectionMetadata() {

        return Promise.resolve([
            {
                uri: config.get('databasePrefix') + 'public/' + this.remoteConfig.id +
                            '/' + this.remoteConfig.rootCollection.displayId
                                + '/current',
                version: 'current',
                name: this.remoteConfig.rootCollection.name,
                displayId: this.remoteConfig.rootCollection.displayId,
                description: this.remoteConfig.rootCollection.description,
                wasDerivedFrom: this.remoteConfig.url,
                remote: true
            }
        ])

    }

    async getAvailableCollectionMetadata() {

        return Promise.resolve([
            {
                uri: config.get('databasePrefix') + 'public/' + this.remoteConfig.id +
                            '/available/current',
                version: 'current',
                displayId: 'available',
                name: 'All Available Entries',
                description: 'Contains all available entries',
                wasDerivedFrom: this.remoteConfig.url + '/folders/available',
                remote: true
            }
        ])

    }

    async getContainingCollections(uri:string) {

        var rootUri = config.get('databasePrefix') + 'public/' + this.remoteConfig.id + '/' + this.remoteConfig.id + '_collection/current'
        
        if (uri != rootUri) {
        return Promise.resolve([{
            uri: rootUri,
            name: this.remoteConfig.rootCollection.name
        }])
        } else {
        return Promise.resolve([])
        }

    }


    async getCollectionMembers(uri, limit?, offset?) {

        const { displayId } = splitUri(uri)

        if(displayId === this.remoteConfig.rootCollection.displayId) {

            return ice.getRootFolders(this.remoteConfig, offset, limit).then(foldersToCollections)

        }

        if(displayId === 'available') {

        return ice.getRootFolderEntries(this.remoteConfig, offset, limit).then(entriesToMetadata).then(concatArrays)

        }

        const folderId = parseInt(displayId.slice(this.remoteConfig.folderPrefix.length))

        return ice.getFolderEntries(this.remoteConfig, folderId, offset, limit).then(entriesToMetadata).then(concatArrays)

        function concatArrays(arrs) {

            const res = []

            arrs.forEach((arr) => {
                Array.prototype.push.apply(res, arr)
            })

            return Promise.resolve(res)
        }

        function foldersToCollections(folders) {

            return Promise.resolve(folders.map((folder) => {
            return {
                    type: 'http://sbols.org/v2#Collection',
                    displayId: this.remoteConfig.folderPrefix + folder.id,
                    version: 'current',
                    uri: config.get('databasePrefix') + 'public/' + this.remoteConfig.id + '/' + this.remoteConfig.folderPrefix + folder.id + '/current',
                    name: folder.folderName,
                    description: folder.description,
                    wasDerivedFrom: this.remoteConfig.url + '/folders/' + folder.id,
                    remote: true
            }
        })).then((result) => { 
            result.unshift({
            type: 'http://sbols.org/v2#Collection',
            displayId: 'available',
            version: 'current',
            uri: config.get('databasePrefix') + 'public/' + this.remoteConfig.id + '/available/current',
            name: 'All Available Entries',
            description: 'Contains all available entries',
            wasDerivedFrom: this.remoteConfig.url + '/folders/available',
            remote: true
                })
            return Promise.resolve(result) 
        })

        }

        function entriesToMetadata(entries) {

            const version = 'current'

            return Promise.resolve(entries.map((entry) => {

                const res = [
                    {
                        type: 'http://sbols.org/v2#ComponentDefinition',
                        uri: config.get('databasePrefix') + 'public/' + this.remoteConfig.id + '/' + entry.partId + '/' + version,
                        displayId: entry.partId,
                        version: version,
                        name: entry.name,
                        description: entry.shortDescription,
                        wasDerivedFrom: this.remoteConfig.url + '/entry/' + entry.partId,
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
            }))

        }

    }

    async getCollectionMetadata(uri) {

        const { displayId } = splitUri(uri)

        if(displayId === this.remoteConfig.rootCollection.displayId) {

            return this.getRootCollectionMetadata().then(
                        (metadata) => Promise.resolve(metadata[0]))

        }

        if(displayId === 'available') {

            return this.getAvailableCollectionMetadata().then(
                        (metadata) => Promise.resolve(metadata[0]))

        }

        const folderId = parseInt(displayId.slice(this.remoteConfig.folderPrefix.length))

        return ice.getFolder(this.remoteConfig, folderId).then((folder) => {

            return Promise.resolve({
                type: 'http://sbols.org/v2#Collection',
                displayId: this.remoteConfig.folderPrefix + folder.id,
                version: 'current',
                uri: config.get('databasePrefix') + this.remoteConfig.id + '/' + this.remoteConfig.folderPrefix + folder.id + '/current',
                name: folder.folderName,
                description: folder.description,
                wasDerivedFrom: this.remoteConfig.url + '/folders/' + folder.id,
                remote: true
            })

        })

    }

    async getSubCollections(uri) {

        const { displayId } = splitUri(uri)

        if(displayId === this.remoteConfig.rootCollection.displayId) {

            return this.getCollectionMembers(uri)

        } else {

            return Promise.resolve([])

        }

    }

    async getType(uri) {

        const { displayId } = splitUri(uri)

        if(displayId === this.remoteConfig.rootCollection.displayId) {

            return 'http://sbols.org/v2#Collection'

        } else if(displayId === 'available') {

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


