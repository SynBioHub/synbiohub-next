import SBHURI from "synbiohub/SBHURI";
import { SBHRequest } from "synbiohub/SBHRequest";
import View from "synbiohub/views/View";
import { Response } from 'express'

export default class ViewConcerningTopLevel extends View {

    constructor() {
        super()
    }

    uri:SBHURI

    async prepare(req:SBHRequest) {

        this.uri = SBHURI.fromURIOrURL(req.url)

    }

    async render(res:Response) {
        throw new Error("Method not implemented.");
    }
}

