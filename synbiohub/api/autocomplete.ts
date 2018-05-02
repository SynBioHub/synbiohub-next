
import cache from 'synbiohub/cache';
import ExecutionTimer from 'synbiohub/util/execution-timer';

export default function(req, res) {


    var searchTimer = ExecutionTimer('search autocompletions')

    res.send(JSON.stringify(cache.autocompleteTitle.get(req.params.query)))

    searchTimer()

};

