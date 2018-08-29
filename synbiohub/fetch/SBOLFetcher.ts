
import { SBOL2Graph, S2Identified } from 'sbolgraph'

import tmp = require('tmp-promise')
import * as fs from 'mz/fs'
import serializeSBOL from 'synbiohub/serializeSBOL';
import SBHURI from 'synbiohub/SBHURI';

export interface FetchResult {
    sbol:SBOL2Graph
    object:S2Identified
    remote:any
}

export default abstract class SBOLFetcher {

    abstract async fetchSBOLObjectRecursive(uri:SBHURI, type?:string, intoGraph?:SBOL2Graph):Promise<FetchResult>;

    //abstract getCollectionMembersRecursive(collectionUri:string, graphUri:string):any;



    /* Dumb implementation, often overridden
     * returns temp filename
    */
    async fetchSBOLSource(uri:SBHURI, type?:string):Promise<string> {

        let res = await this.fetchSBOLObjectRecursive(uri, type)

        let tmpFilename = await tmp.tmpName()

        await fs.writeFile(tmpFilename, serializeSBOL(res.sbol))

        return tmpFilename
    }


}

