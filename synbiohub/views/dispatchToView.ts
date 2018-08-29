
export default function dispatchToView(View) {

    return async function(req, res) {

        let view = new View()

        try {
            await view.prepare(req)
        } catch(e) {
            let message = [
                'Error preparing view',
                (e.stack || e)
            ].join('\n')
            res.header('content-type', 'text/plain')
            res.send(message)
            return
        }

        try {
            await view.render(res)
        } catch(e) {
            let message = [
                'Error rendering view',
                (e.stack || e)
            ].join('\n')
            res.header('content-type', 'text/plain')
            res.send(message)
            return
        }

    }
    
}
