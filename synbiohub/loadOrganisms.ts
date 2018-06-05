let TrieSearch = require('trie-search')

let organisms = require('/home/chris/Desktop/Dev/synbiohub-v2/faketax.json')

let ts = new TrieSearch()
    
ts.addFromObject(organisms)

ts.options.maxCacheSize=500

export default function(req, res){
    
    let query = req.params.query

    let matches = ts.get(query)

    matches = JSON.stringify(matches.map((r) => r._key_))

    console.log(matches)

    res.send(matches)

}