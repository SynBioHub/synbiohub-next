
import SBOLDocument = require('sboljs')

import tmp = require('tmp-promise')
import * as fs from 'mz/fs'
import serializeSBOL from 'synbiohub/serializeSBOL';

export default abstract class SBOLFetcher {

    abstract async fetchSBOLObjectRecursive(uri:string, type?:string, intoDocument?:SBOLDocument):Promise<any>;

    //abstract getCollectionMembersRecursive(collectionUri:string, graphUri:string):any;



    /* Dumb implementation, often overridden
     * returns temp filename
    */
    async fetchSBOLSource(uri:string, type?:string):Promise<string> {

        let res = await this.fetchSBOLObjectRecursive(uri, type)

        let tmpFilename = await tmp.tmpName()

        await fs.writeFile(tmpFilename, serializeSBOL(res.sbol))

        return tmpFilename
    }


}

