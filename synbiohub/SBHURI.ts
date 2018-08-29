import config from "synbiohub/config";

let dbPrefix = config.get('databasePrefix')
let instanceURL = config.get('instanceUrl')

export default class SBHURI {

    userPart:string|null
    projectPart:string
    idPart:string
    versionPart:string|null
    extraPart:string|null

    constructor(userPart:string|null, projectPart:string, idPart:string, versionPart:string|null, extraPart?:string) {
        this.userPart = userPart
        this.projectPart = projectPart
        this.idPart = idPart
        this.versionPart = versionPart
        this.extraPart = extraPart || null
    }

    static fromURIOrURL(url:string):SBHURI {

        let path:string|null = null

        if(url[0] === '/') {
            path = url.slice(1)
        } else {
            if(url.indexOf(dbPrefix) === 0) {
                path = url.slice(dbPrefix)
            } else if(url.indexOf(instanceURL) === 0) {
                path = url.slice(instanceURL)
            } else {
                throw new Error('URI/URL does not start with either prefix: ' + url)
            }
        }

        let pathParts = path.split('/')
        
        if(pathParts[0] === 'public') {

            if(pathParts.length >= 4) {
                // public/igem/bba_foo/1
                return new SBHURI(null, pathParts[1], pathParts[2], pathParts[3], pathParts.slice(4).join('/'))
            } else if(pathParts.length >= 3) {
                // public/igem/bba_foo
                return new SBHURI(null, pathParts[1], pathParts[2], null, pathParts.slice(3).join('/'))
            } else {
                throw new Error('bad number of path parts')
            }

        } else if(pathParts[0] === 'user') {

            if(pathParts.length >= 5) {
                // user/foo/igem/bba_foo/1
                return new SBHURI(pathParts[1], pathParts[2], pathParts[3], pathParts[4], pathParts.slice(5).join('/'))
            } else if(pathParts.length >= 4) {
                // user/foo/igem/bba_foo
                return new SBHURI(pathParts[1], pathParts[2], pathParts[3], null, pathParts.slice(4).join('/'))
            } else {
                throw new Error('bad number of path parts')
            }
        } else {
            throw new Error('path does not start with public or user')
        }
    }

    private createPersistentIdentityPath():string {
        return (this.userPart ? 'user/' + encodeURIComponent(this.userPart) : 'public')
                    + '/' + encodeURIComponent(this.projectPart)
                    + '/' + encodeURIComponent(this.idPart)
    }

    private createPath():string {
        return this.createPersistentIdentityPath() 
                    + (this.versionPart ? ('/' + encodeURIComponent(this.versionPart)) : '')
    }

    toURL():string {
        return instanceURL + this.createPath()
    }

    toURI():string {
        return dbPrefix + this.createPath()
    }

    toString():string {
        return this.toURI()
    }

    isPublic():boolean {
        return this.userPart === null
    }

    getUser():string|null {
        return this.userPart
    }

    getUserURI():string|null {

        if(!this.userPart)
            return null

        return dbPrefix + 'user/' + encodeURIComponent(this.userPart)
    }

    getUserURL():string|null {

        if(!this.userPart)
            return null

        return instanceURL + 'user/' + encodeURIComponent(this.userPart)
    }

    getDisplayId():string {
        return this.idPart
    }

    getVersion():string {
        return this.versionPart
    }

    getProject():string {
        return this.projectPart
    }

    getURIPrefix():string {
        return dbPrefix + (this.userPart ? 'user/' + encodeURIComponent(this.userPart) : 'public') + '/' + this.projectPart + '/'
    }

    getURLPrefix():string {
        return instanceURL + (this.userPart ? 'user/' + encodeURIComponent(this.userPart) : 'public') + '/' + this.projectPart + '/'
    }

    getGraph():string {

        if(!this.userPart) {
            return config.get('triplestore').defaultGraph
        } else {
            return dbPrefix + 'user/' + encodeURIComponent(this.userPart)
        }
    }

    getPersistentIdentity():string {
        return dbPrefix + this.createPersistentIdentityPath()
    }

    getExtraPart():string|null {
        return this.extraPart
    }
}
