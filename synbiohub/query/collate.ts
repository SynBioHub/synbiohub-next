
export function collateObjects(objects) {

    var res = {}

    objects.forEach((obj) => {

        res = extend(res, obj)

    })

    return res

}

export function collateArrays(arrays) {

    var res = []

    arrays.forEach((arr) => {

        Array.prototype.push.apply(res, arr)

    })

    return res
}


