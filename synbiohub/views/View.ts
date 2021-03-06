
import { Request, Response } from 'express'
import config from 'synbiohub/config'
import Menu, { MenuItem } from 'synbiohub/Menu';
import { SBHRequest } from 'synbiohub/SBHRequest';

export default abstract class View {

    config:any
    user:any

    title:string
    metaDesc:string
    menu:Menu

    constructor() {

        this.config = config.get()

        this.menu = new Menu()

        this.title = 'Untitled View'
        this.metaDesc = 'No meta description set for this view - please set one!'

    }

    async prepare(req:SBHRequest) {

        this.user = req.user

        if(this.user) {
            this.menu.addItem(new MenuItem('Projects', '/projects', 'fa-folder'))
            this.menu.addItem(new MenuItem('Create New Project', '/newproject', 'fa-plus'))
            this.menu.addItem(new MenuItem('Admin', '/admin', 'fa-cogs'))
            this.menu.addItem(new MenuItem('Profile', '/profile', 'fa-id-card'))
            this.menu.addItem(new MenuItem('Logout', '/logout', 'fa-sign-out-alt'))
        } else {
            this.menu.addItem(new MenuItem('Login or Register', '/login', 'fa-sign-in'))
        }
    }

    abstract async render(res:Response)

}