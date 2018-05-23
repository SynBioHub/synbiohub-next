
import { Request } from 'express'

export interface SBHRequest extends Request {

    user:any
    session:any
    forceNoHTML:boolean

}


