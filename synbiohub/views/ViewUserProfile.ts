import config from 'synbiohub/config';
import db from 'synbiohub/db';
import pug = require('pug');
import View from 'synbiohub/views/View';
import { SBHRequest } from 'synbiohub/SBHRequest';
import { Response } from 'express'

export default class ViewUserProfile extends View {

  otherUser:any

  constructor() {
    super()
  }

  async prepare(req:SBHRequest) {

    await super.prepare(req)

    let username = req.params.username

    this.otherUser = await db.model.User.findOne({
      where: {
        username: username
      }
    })

  }

  async render(res:Response) {

    if(!this.otherUser) {
      res.status(404).send('user not found')
      return
    }

    res.render('templates/views/userProfile.jade', this)
  }

}
