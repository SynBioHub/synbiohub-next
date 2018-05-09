
import ViewTopLevel from "synbiohub/views/ViewTopLevel";
import DefaultMDFetcher from "../fetch/DefaultMDFetcher";

export default class ViewTopLevelWithMetadata extends ViewTopLevel {

    constructor() {
        super()
    }


    async prepare(req:Request) {

        super.prepare(req)


    }

    async render(res:Response) {
        throw new Error("Method not implemented.");
    }
     

}
