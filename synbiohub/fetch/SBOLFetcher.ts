
export default abstract class SBOLFetcher {

    abstract async fetchSBOLObjectRecursive(sbol:any, type:string, uri:string):Promise<any>;

    //abstract getCollectionMembersRecursive(collectionUri:string, graphUri:string):any;



    /* Dumb implementation, often overridden
     * returns temp filename
    */
    async fetchSBOLSource(type:string, objectUri:string):Promise<string> {

        let res = await this.fetchSBOLObjectRecursive(new SBOLDocument(), type, objectUri)

        let tmpFilename = await tmp.tmpName()

        await fs.writeFile(tmpFilename, serializeSBOL(res.sbol))

        return tmpFilename
    }


}

