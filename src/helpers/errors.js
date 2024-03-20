export const handleErr = (resp, setError) => {
    if (resp.response.status === 400) {
        const errors = resp.response.data
       // console.log('errors', errors)
        for (const key in errors) {
            setError(key, { type: 'typeError', message: errors[key] })
        }
    }
    else
        console.log(resp);
}

export const handleCtrlErr = (resp, setErrors) => {
    if (resp.response.status === 400) {
        const errors = resp.response.data
        console.log('errors', errors)
        setErrors(errors)
    }
    else
        console.log(resp);
}