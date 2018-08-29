import { S2Identified } from "sbolgraph";

export interface Mutable {
    source:string
    rendered:string
}

export default class Mutables {

    object:S2Identified

    source:Mutable
    description:Mutable
    citations:Mutable
    notes:Mutable

    constructor(object:S2Identified) {
        this.object = object

        this.source = {
            source: '',
            rendered: ''
        }
        this.description = {
            source: '',
            rendered: ''
        }
        this.citations = {
            source: '',
            rendered: ''
        }
        this.notes = {
            source: '',
            rendered: ''
        }
    }



}
