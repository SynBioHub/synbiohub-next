

const pug = require('pug')
import db from 'synbiohub/db'

const sha1 = require('sha1')
import config from 'synbiohub/config'

module.exports = function(req, res) {

    const token = req.body.token.trim()

    if(token.length === 0) {
        res.status(500).send('invalid token')
        return
    }

    let user = await db.model.User.findOne({

        where: {
            resetPasswordLink: token
        } 

    })

    if (!user) {
        res.status(500).send('bad token')
        return
    }

    user.resetPasswordLink = ''
    user.password = sha1(config.get('passwordSalt') + sha1(req.body.password1))

    req.session.user = user.id
    req.user = user

    await user.save()

    res.redirect('/')
}


