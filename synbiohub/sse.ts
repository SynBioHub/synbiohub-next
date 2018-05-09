

import SSE from 'express-sse';
import Multimap from 'multimap';

const connections = new Multimap()

export function initSSE(app) {

    app.get('/sse/*', (req, res, next) => {

        const sse = new SSE([])
        const path = req.url.slice('/sse/'.length)

        sse.init(req, res)

        connections.set(path, sse)

    })
}

export function push(path, eventName, data) {

    connections.get(path).forEach((sse) => {
        sse.send(data || {}, eventName)
    })

}

