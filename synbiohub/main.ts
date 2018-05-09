import config from "synbiohub/config";
import theme from "synbiohub/theme";
import * as java from "synbiohub/java";
import App from "synbiohub/app";
import db from "synbiohub/db";
import { fs } from "mz";



if(fs.existsSync('synbiohub.sqlite') && config.get('firstLaunch') === true) {
    fs.unlinkSync('synbiohub.sqlite')
}



if(!fs.existsSync('synbiohub.sqlite')) {
    db.sequelize.sync({ force: true }).then(startServer)
} else {
    db.umzug.up().then(() => {
        startServer()
    })
}

function startServer() {

    return initSliver()
                .then(() => java.init())
                .then(() => theme.setCurrentThemeFromConfig())
                .then(() => {

        var app = App()

        app.listen(parseInt(config.get('port')))
    })
}


function initSliver() {

    return new Promise((resolve, reject) => {

        // TODO
        resolve()


    })
}

process.on('SIGINT', function() {

    java.shutdown().then(() => process.exit())
    
})


