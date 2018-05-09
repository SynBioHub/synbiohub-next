
const pug = require('pug')

import config from 'synbiohub/config'

const spawn = require('child_process').spawn


export default async function(req, res) {

    const prefix = req.params.prefix

    let result = await restoreBackup(prefix)

    res.redirect('/admin/backup')
};

async function restoreBackup(prefix) {

    return await new Promise((resolve, reject) => {

        const args = [
            prefix
        ]

        const child = spawn(process.cwd() + '/scripts/restore_backup.sh', args)

        var output = []

        child.stdout.on('data', (data) => {

            console.log(data.toString())

            output.push(data)
        })

        child.stderr.on('data', (data) => {

            console.log(data.toString())

        })

        child.on('close', (exitCode) => {

            if(exitCode !== 0) {
                reject(new Error('restore_backup.sh returned exit code ' + exitCode))
                return
            }

            resolve(output.join(''))

        })

    })

}

