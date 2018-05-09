
import View from "synbiohub/views/View";
import getUrisFromReq, { ReqURIInfo } from "../getUrisFromReq";

export default abstract class ViewTopLevel extends View {

    uriInfo:ReqURIInfo

    constructor() {

        super()

    }

    async prepare(req:Request) {

        this.uriInfo = getUrisFromReq(req)

    }

     



}
