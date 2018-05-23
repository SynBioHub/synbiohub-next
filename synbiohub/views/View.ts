
import { Request, Response } from 'express'
import config from 'synbiohub/config'
import Menu, { MenuItem } from 'synbiohub/Menu';

export default abstract class View {

    config:any
    user:any
    menu:Menu

    constructor() {

        this.config = config.get()

        this.menu = new Menu()



    }

    async prepare(req:SBHRequest) {

        this.user = req.user

        if(this.user) {
            this.menu.addItem(new MenuItem('Submit', '/submit', 'fa-cloud-upload-alt'))
            this.menu.addItem(new MenuItem('Shared with Me', '/shared', 'fa-bolt'))
            this.menu.addItem(new MenuItem('Submissions', '/manage', 'fa-align-left'))
            this.menu.addItem(new MenuItem('Admin', '/admin', 'fa-cogs'))
            this.menu.addItem(new MenuItem('Profile', '/profile', 'fa-id-card'))
            this.menu.addItem(new MenuItem('Logout', '/logout', 'fa-sign-out-alt'))
        } else {
            this.menu.addItem(new MenuItem('Login or Register', '/login', 'fa-sign-in'))
        }
    }

    abstract async render(res:Response)

}