
import FMAPrefix from './FMAPrefix'

async function main() {

    console.time('fmaprefix')

    let results = await FMAPrefix.search('alls.txt', 'ba')

    console.timeEnd('fmaprefix')

    console.log(results.length)
} 

main()