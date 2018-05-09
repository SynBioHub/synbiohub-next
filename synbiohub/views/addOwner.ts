const pug = require('pug');
import db from 'synbiohub/db'
import config from 'synbiohub/config'
import getUrisFromReq from 'synbiohub/getUrisFromReq'
import addOwnedBy from 'synbiohub/actions/addOwnedBy'

module.exports = function (req, res) {

    if (req.method === 'POST') {
        post(req, res)
    } else {
        view(req, res)
    }
}

async function view(req, res) {
    const {
        graphUri,
        uri,
        designId
    } = getUrisFromReq(req, res);

    let users = await db.model.User.findAll()

    let locals = {
        config: config.get(),
        user: req.user,
        users: users,
        uri: uri
    }

    res.send(pug.renderFile('templates/views/addOwner.jade', locals))
}

function post(req, res) {

    await addOwnedBy(req, res)

    res.redirect(req.originalUrl.replace('/addOwner', ''));

}