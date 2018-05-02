
export default abstract class SBOLFetcher {

    abstract fetchSBOLObjectRecursive(sbol:any, type:string, uri:string, graphUri:string):any;

    abstract getCollectionMembersRecursive(collectionUri:string, graphUri:string):any;



    /* Dumb implementation, often overridden
    */
    async fetchSBOLSource(remoteConfig, type, objectUri) {

        let res = await this.fetchSBOLObjectRecursive(remoteConfig, new SBOLDocument(), type, objectUri)

        let tmpFilename = await tmp.tmpName()

        await fs.writeFile(tmpFilename, serializeSBOL(res.sbol))

        return tmpFilename
    }


    async fetchCollectionFASTA(collectionUri:string) {

        const graphUri = getGraphUriFromTopLevelUri(collectionUri, user)

        let members = await this.getCollectionMembersRecursive(collectionUri, graphUri)

        const flattenedMembers = []

        members.forEach(flattenMember)

        function flattenMember(member) {

            flattenedMembers.push(member)

            if(member.members !== undefined) {

                Array.prototype.push.apply(flattenedMembers, member.members)

                member.members.forEach(flattenMember)
            }
        }

        const sequences = flattenedMembers.filter((member) => {
            return member.type === 'http://sbols.org/v2#Sequence'
        })

        let sequenceResults = await Promise.all(
            sequences.map((sequence) => fetchSBOLObjectRecursive('Sequence', sequence.uri, graphUri))
        )

        //console.log('ress')
        //console.dir(sequenceResults)

        const sequences = sequenceResults.map((result) => result.object)
        //console.log('seqs')
        //console.log(JSON.stringify(sequences, null, 2))
        // wtf its all URIs
        // also _rootUri is set, looks like it hit the local thingy


        const fasta = []

        sequences.forEach((sequence) => {
            fasta.push('>' + sequence.name)
            fasta.push(sequence.elements)
        })

        return fasta.join('\n')
    }
}

