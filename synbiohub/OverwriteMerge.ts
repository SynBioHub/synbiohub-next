
export enum OverwriteMergeOption {

    FailIfExists = 0,
    OverwriteIfExists = 1,
    MergeA = 2,
    MergeB = 3
}

export default class OverwriteMerge {

    static fromSubmitFields(fields:any):OverwriteMergeOption {

        if (fields.overwrite_merge && fields.overwrite_merge[0]) {

            return OverwriteMerge.fromValue(fields.overwrite_merge[0])

        } else {

            var overwrite_merge

            if (fields.submitType[0] === "new") {
                overwrite_merge = OverwriteMergeOption.FailIfExists
            } else {
                overwrite_merge = OverwriteMergeOption.MergeA
            }

            if (fields.overwrite_objects && fields.overwrite_objects[0]) {

                if(overwrite_merge === OverwriteMergeOption.FailIfExists) {
                    overwrite_merge = OverwriteMergeOption.OverwriteIfExists
                } else if(overwrite_merge === OverwriteMergeOption.MergeA) {
                    overwrite_merge = OverwriteMergeOption.MergeB
                }
            }

            return overwrite_merge
        }

    }

    static fromValue(n:number):OverwriteMergeOption {

        let opt = OverwriteMergeOption[n]

        if(opt === undefined)
            throw new Error('unknown OverwriteMerge value ' + n)

        return OverwriteMergeOption[opt]
    }



}


