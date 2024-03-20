import React, { useEffect } from "react";
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from "yup";
import { useForm, Controller } from "react-hook-form";
import TextField from '@mui/material/TextField';


export default function MyAccount() {

    const schema = yup.object({
        email: yup.string().email().required(),
        'family_name': yup.string().trim().required(),
        'given_name': yup.string().trim().required()
    }).required();

    const user = JSON.parse(sessionStorage.user)
    console.log('user--------', user)

    const { control, reset } = useForm({
        defaultValues: user,
        resolver: yupResolver(schema)
    });

    useEffect(() => {
        reset(user)
    }, [reset, user])


    return (
        <div className="col-6">
            <Controller name="email" control={control} render={({ field }) => <TextField disabled margin='dense' fullWidth label='Email' {...field} />} />
            <Controller name="family_name" control={control} render={({ field }) => <TextField disabled margin='dense' fullWidth label='Last Name' {...field} />} />
            <Controller name="given_name" control={control} render={({ field }) => <TextField disabled margin='dense' fullWidth label='First Name' {...field} />} />

            {/* email: "aditya.tippanaboena@delasoft.com"
                email_verified: "true"
                family_name: "Tippanaboena"
                given_name: "Aditya"
                sub: "ae5aeed7-3894-4f83-8240-1e0a4e8014a2"
                username: "ae5aeed7-3894-4f83-8240-1e0a4e8014a2" */}
        </div>
    )
}