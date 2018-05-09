
import multiparty = require('multiparty')

export interface ParsedForm {
    fields:any
    files:any
}

export default async function parseForm(req):Promise<ParsedForm> {

    const form = new multiparty.Form()

    let rejected = false

    return (await new Promise((resolve, reject) => {

        form.on('error', (err) => {

            if(!rejected) {
                rejected = true
                reject(err)
            }

        })

        form.parse(req, (err, fields, files) => {

            if(rejected)
                return

            if(err) {

                rejected = true
                reject(err)

                return
            }

            resolve({ fields, files })

        })

    })) as ParsedForm
}
