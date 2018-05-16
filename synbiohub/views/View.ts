
import { Request, Response } from 'express'
import config from 'synbiohub/config'

export default abstract class View {

    config:any
    user:any

    constructor() {

        this.config = config.get()

    }

    async prepare(req:Request) {

        this.user = req.user

    }

    abstract async render(res:Response)

}