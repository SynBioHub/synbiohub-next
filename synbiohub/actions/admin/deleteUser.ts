
import db from 'synbiohub/db';

export default async function(req, res) {

    let user = await db.model.User.findById(req.body.id)

    await user.destroy()

    res.status(200).send('saved')
};



