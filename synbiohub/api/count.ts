
const { getCount } = require('../query/count')

var pug = require('pug')

import config from 'synbiohub/config'

module.exports = function(req, res) {

    let result = await getCount(req.params.type, null)

    res.header('content-type', 'text/plain').send(result.toString())
}

