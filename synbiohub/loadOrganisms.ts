import FMAPrefix from './FMAPrefix'

export default async function(req, res){
    
    let query = req.params.query

    let matches = await FMAPrefix.search('./alls.txt', query)

    matches = matches.map((r) =>r.split('|')[0])

    res.send(matches)

}