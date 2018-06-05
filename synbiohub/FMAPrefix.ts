
import config from "synbiohub/config";

import { exec, ChildProcess } from "child_process";

export default class FMAPrefix {

    static async search(dbFilename:string, prefix:string):Promise<Array<string>> {

        let binPath = config.get('fmaprefixPath')

        let cmd = binPath
        cmd += ' ' + dbFilename
        cmd += ' ' + prefix

        return await new Promise<Array<string>>((resolve, reject) => {

            let cp: ChildProcess = exec(cmd, {
                maxBuffer: 1024 * 1024 * 100,
                cwd: process.cwd()
            }, (err, stdout, stderr) => {

                if (err)
                    reject(err)
                else
                    resolve(stdout.split('\n'))
            })

        })

    }

}
