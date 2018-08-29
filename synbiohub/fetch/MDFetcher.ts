import SBHURI from "synbiohub/SBHURI";


export default abstract class MDFetcher {

    abstract async getComponentDefinitionMetadata(uri:SBHURI):Promise<any>

    abstract async getModuleDefinitionMetadata(uri:SBHURI):Promise<any>

    abstract async getCollectionMetadata(uri:SBHURI):Promise<any>
    abstract async getCollectionMemberCount(uri:SBHURI, search?:string):Promise<number>
    abstract async getRootCollectionMetadata():Promise<Array<any>>
    abstract async getContainingCollections(uri:SBHURI):Promise<Array<string>>
    abstract async getCollectionMembers(uri:SBHURI, limit?:number, offset?:number, sortColumn?:string, search?:any):Promise<Array<string>>
    abstract async getSubCollections(uri:SBHURI):Promise<Array<string>>

    abstract async getCount(type:string):Promise<any>

    abstract async getName(uri:SBHURI):Promise<string>
    abstract async getType(uri:SBHURI):Promise<string>
    abstract async getVersion(uri:SBHURI):Promise<string>

    abstract async getOwnedBy(uri:SBHURI):Promise<string>
}



