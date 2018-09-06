

export enum SortDirection {
    Ascending,
    Descending
}

export default class DatastoreSearchQuery {

    sortByPredicate:string|undefined
    sortDirection:SortDirection|undefined
    offset:number|undefined
    limit:number|undefined
    substring:string|undefined

    constructor() {
    }

    setSortBy(predicate:string) {
        this.sortByPredicate = predicate
    }

    setSortDirection(dir:SortDirection) {
        this.sortDirection = dir
    }

    setSubstring(substring:string) {
        this.substring = substring
    }

    setOffset(offset:number) {
        this.offset = offset
    }

    setLimit(limit:number) {
        this.limit = limit
    }
}

