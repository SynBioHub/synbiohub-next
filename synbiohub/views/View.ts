
import { Request, Response } from 'express'

export default abstract class View {

    constructor() {
    }

    abstract async prepare(req:Request)
    abstract async render(res:Response)

}