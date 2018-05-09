
import { Request, Response } from 'express'
import config from 'synbiohub/config'

export default abstract class View {

    config:any

    constructor() {

        this.config = config.get()

    }

    abstract async prepare(req:Request)
    abstract async render(res:Response)

}