
import pug = require('pug');
import * as os from 'os'
import config from 'synbiohub/config';

export default function(req, res) {

	var locals = {
        config: config.get(),
        section: 'admin',
        adminSection: 'status',
        user: req.user,
        nodeVersion: process.version,
        architecture: os.arch(),
        platform: os.type(),
        osRelease: os.release()
    }
	
    res.send(pug.renderFile('templates/views/admin/status.jade', locals))
	
};
