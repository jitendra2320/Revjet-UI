export const getOptions = (opts = [], v, k) => {
    return [<option key='temp'>Select One</option>].concat(opts.map((e, idx) => {
        if (typeof e === 'string')
            return <option key={idx} value={e}>{e}</option>
        return <option key={e[v]} value={e[v]}>{e[k]}</option>
    }))
}