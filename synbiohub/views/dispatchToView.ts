
export default function dispatchToView(View) {

    return async function(req, res) {

        let view = new View()

        await view.prepare(req)
        await view.render(res)

    }
    
}
