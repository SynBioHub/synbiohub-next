import config from 'synbiohub/config';
import db from 'synbiohub/db';
import pug = require('pug');


export default async function(req, res) {

  let username = req.params.username

  let user = await db.model.User.findOne({

    where: {
      username: username
    }
  })



  if(!user) {
    res.status(404).send('I looked but could not find :-()')
    return
  }

    var locals = {
          config: config.get(),
          section: 'component',
          user: req.user,
          otherUser: user
      }

  res.send(pug.renderFile('templates/views/userProfile.jade', locals))
};
