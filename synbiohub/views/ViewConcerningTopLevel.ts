import SBHURI from "synbiohub/SBHURI";
import { SBHRequest } from "synbiohub/SBHRequest";
import View from "synbiohub/views/View";

export default class ViewConcerningTopLevel extends View {

    constructor() {
        super()
    }

    uri:SBHURI

    async prepare(req:SBHRequest) {

        this.uri = SBHURI.fromURIOrURL(req.url)

    }
}

