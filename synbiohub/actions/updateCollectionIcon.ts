
const fs = require('fs')
import config from 'synbiohub/config'
const extend = require('xtend')

import pug = require('pug')
import SBHURI from 'synbiohub/SBHURI';

export default async function (req, res) {

    // TODO reimplement
    /*

    const uri = SBHURI.fromURIOrURL(req.url)

    let ownedBy = await DefaultMDFetcher.get(req).getOwnedBy(uri)

    if (ownedBy.indexOf(config.get('databasePrefix') + 'user/' + req.user.username) === -1) {
        //res.status(401).send('not authorized to edit this submission')
        const locals = {
            config: config.get(),
            section: 'errors',
            user: req.user,
            errors: ['Not authorized to remove this submission']
        }
        res.send(pug.renderFile('templates/views/errors/errors.jade', locals))
    }

    if (req.file) {
        let iconFile = req.file

        var collectionIcons = config.get('collectionIcons')
        const iconFilename = 'public/local/' + iconFile.originalname

        fs.writeFileSync(iconFilename, iconFile.buffer)

        collectionIcons = extend(collectionIcons, {
            [req.body.collectionUri]: '/local/' + iconFile.originalname
        })

        config.set('collectionIcons', collectionIcons)
    }

    res.redirect(req.body.collectionUrl)*/
}


