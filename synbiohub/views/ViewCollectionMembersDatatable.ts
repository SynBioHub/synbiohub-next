
import ViewConcerningTopLevel from "./ViewConcerningTopLevel";
import { SBHRequest } from "../SBHRequest";
import { Response } from 'express'
import { SBOL2Graph, S2Collection } from "sbolgraph";
import DatastoreSearchQuery from "../datastore/DatastoreSearchQuery";

export default class ViewCollectionMembersDatatable extends ViewConcerningTopLevel {

    draw:number
    unfilteredMemberCount:number
    filteredMemberCount:number
    filteredMembers:any[]

    constructor() {
        super()
    }

    async prepare(req:SBHRequest) {

        await super.prepare(req)

        let offset = parseInt(req.query.start)
        let length = parseInt(req.query.length)

        let sortParams = req.query.order !== undefined && req.query.order.length === 1 ?
                req.query.order[0] : {}

        if (sortParams) {
            sortParams.column = [
                'name',
                'displayId',
                'displayType',
                'description'
            ][parseInt(sortParams['column'])]
        }



        let search = req.query.search.value

        let searchQuery:DatastoreSearchQuery|undefined = new DatastoreSearchQuery()
        searchQuery.setSubstring(search)
        searchQuery.setOffset(offset)
        searchQuery.setLimit(length)

        let graph = new SBOL2Graph()
        let collection = new S2Collection(graph, this.uri.toURI())

        let p_unfilteredMemberCount = this.datastore.countMembers(collection)
        let p_filteredMemberCount = this.datastore.countMembers(collection, searchQuery)
        let p_filteredMembers = this.datastore.fetchMembersMetadata(graph, collection, searchQuery)

        this.unfilteredMemberCount = await p_unfilteredMemberCount
        this.filteredMemberCount = await p_filteredMemberCount
        this.filteredMembers = await p_filteredMembers
    }

    async render(res:Response) {

        res.header('content-type', 'application/json')

        res.send(JSON.stringify({
            draw: this.draw,
            recordsTotal: this.unfilteredMemberCount,
            recordsFiltered: this.filteredMemberCount,
            data: this.filteredMembers
        }))
    }



}

