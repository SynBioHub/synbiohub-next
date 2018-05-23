
import pug = require('pug');
import extend = require('xtend')
import db from 'synbiohub/db';
import sha1 = require('sha1');
import config from 'synbiohub/config';
import apiTokens from 'synbiohub/apiTokens';
import { SBHRequest } from 'synbiohub/SBHRequest';
import { Response } from 'express'
import View from 'synbiohub/views/View';

export default class ViewLogin extends View {

    alreadyLoggedIn:boolean
    email:string
    nextPage:string
    loginAlert:string
    forgotPasswordEnabled:boolean 
    api:boolean

    constructor() {

        super()

        this.nextPage = '/'
        this.forgotPasswordEnabled = config.get("mail").sendgridApiKey != ""
    }

    async prepare(req:SBHRequest) {

        await super.prepare(req)

        if(req.query.next)
            this.nextPage = req.query.next

        this.api = (req.forceNoHTML || !req.accepts('text/html'))

        if(req.method === 'POST') {
            await this.loginPost(req)
        }


    }

    async render(res:Response) {

        if(this.user) {

            if (this.api) {
                res.type('text/plain').send(apiTokens.createToken(this.user))
            } else {
                res.redirect(this.nextPage)
            }

            return
        }

        res.render('templates/views/login.jade', this)
    }

    private async loginPost(req:SBHRequest) {

        if(req.body.email) {
            this.email = req.body.email
        } else {
            this.loginAlert = 'Please enter your e-mail address and password.'
            return
        }

        let user = await db.model.User.findOne({
            where: db.sequelize.or({ email: req.body.email }, { username: req.body.email })
        })

        var passwordHash = sha1(config.get('passwordSalt') + sha1(req.body.password))

        if(!user || passwordHash !== user.password) {
            this.loginAlert = 'Your e-mail address and/or password were not recognized'
            return
        }

        this.user = user

        req.session.user = user.id

        await new Promise((resolve, reject) => {
            req.session.save((err) => {
                if (err)
                    reject(err)
                else
                    resolve()
            })
        })
    }
}


