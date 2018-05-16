

export default abstract class MDFetcher {

    abstract async getComponentDefinitionMetadata(uri:string):Promise<any>

    abstract async getModuleDefinitionMetadata(uri:string):Promise<any>

    abstract async getCollectionMetadata(uri:string):Promise<any>
    abstract async getCollectionMemberCount(uri:string, search?:string):Promise<number>
    abstract async getRootCollectionMetadata():Promise<Array<any>>
    abstract async getContainingCollections(uri:string):Promise<Array<string>>
    abstract async getCollectionMembers(uri:string, limit?:number, offset?:number, sortColumn?:string, search?:any):Promise<Array<string>>
    abstract async getSubCollections(uri:string):Promise<Array<string>>

    abstract async getCount(type:string):Promise<any>

    abstract async getName(uri:string):Promise<string>
    abstract async getType(uri:string):Promise<string>
    abstract async getVersion(uri:string):Promise<string>

    abstract async getOwnedBy(uri:string):Promise<string>
}



