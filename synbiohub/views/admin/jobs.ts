
import pug from 'pug';
import * as sparql from 'synbiohub/sparql/sparql';
import jobUtils from 'synbiohub/jobs/job-utils';
import db from 'synbiohub/db';
import config from 'synbiohub/config';

export default async function(req, res) {

    let jobs = await db.model.Job.findAll({
        include: [
            { model: db.model.User },
            { model: db.model.Task }
        ]
    })

    var locals = {
        config: config.get(),
        section: 'admin',
        adminSection: 'jobs',
        user: req.user,
        jobs: jobs
    }

    res.send(pug.renderFile('templates/views/admin/jobs.jade', locals))
};

