import moment from "moment"

export const stringCompare = (a, b) => a.toUpperCase() > b.toUpperCase()

export const numberCompare = (a, b) => { if (a - b > 0) return true }

export const dateCompare = (a, b) => moment(a).isAfter(b)

export const dateFormat = (val) => {
    const date = moment(val)
    if (date.isValid())
        return date.format('MM/DD/YYYY')
    return val

}

export const gridDateFormat = (val) => {
    const date = moment(val)
    if (date.isValid())
        return date.format('MM/DD/YYYY')
    return 'NA'

}

