
import pug from 'pug';
import * as sparql from 'synbiohub/sparql/sparql';
import db from 'synbiohub/db';
import config from 'synbiohub/config';

export default async function(req, res) {

    let users = await db.model.User.findAll()

    var locals = {
        config: config.get(),
        section: 'admin',
        adminSection: 'users',
        user: req.user,
        users: users,
        canSendEmail: config.get('mail').sendgridApiKey != ""
    }

    res.send(pug.renderFile('templates/views/admin/users.jade', locals))
};


