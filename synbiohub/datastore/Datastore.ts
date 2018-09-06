
import { SBOL2Graph, S2Collection, S2Identified } from 'sbolgraph'
import DatastoreSearchQuery from './DatastoreSearchQuery';

export default abstract class Datastore {

    abstract supportsSPARQL():boolean

    async sparqlSelect(query:string):Promise<any[]> {
        throw new Error('sparqlSelect not implemented')
    }

    async sparqlConstruct(intoGraph:SBOL2Graph, query:string) {
        throw new Error('sparqlConstruct not implemented')
    }




    // type, ownedBy, name, description
    abstract async fetchMetadata(intoGraph:SBOL2Graph, identified:S2Identified)

    abstract async fetchEverything(intoGraph:SBOL2Graph, identified:S2Identified)


    /// Metadata in SBH lab is just an SBOL object with only the type/uri/name/description populated
    ///
    // Fetch the metadata of collections that are not members of any other collection
    abstract async fetchRootCollectionMetadata(intoGraph:SBOL2Graph)

    // Fetch the metadata of members of a collection 
    // TODO what about filtering "subcollections" like the sparql query did
    abstract async countMembers(collection:S2Collection, searchQuery?:DatastoreSearchQuery):Promise<number>
    abstract async fetchMembersMetadata(intoGraph:SBOL2Graph, collection:S2Collection, searchQuery?:DatastoreSearchQuery)

    abstract async fetchContainingCollectionMetadata(intoGraph:SBOL2Graph, identified:S2Identified)




}

