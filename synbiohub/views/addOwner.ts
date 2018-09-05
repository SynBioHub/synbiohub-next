const pug = require('pug');
import db from 'synbiohub/db'
import config from 'synbiohub/config'
import addOwnedBy from 'synbiohub/actions/addOwnedBy'
import SBHURI from 'synbiohub/SBHURI';

export default function (req, res) {

    if (req.method === 'POST') {
        post(req, res)
    } else {
        view(req, res)
    }
}

async function view(req, res) {

    let uri = SBHURI.fromURIOrURL(req.url)

    let users = await db.model.User.findAll()

    let locals = {
        config: config.get(),
        user: req.user,
        users: users,
        uri: uri
    }

    res.send(pug.renderFile('templates/views/addOwner.jade', locals))
}

async function post(req, res) {

    await addOwnedBy(req, res)

    res.redirect(req.originalUrl.replace('/addOwner', ''));

}