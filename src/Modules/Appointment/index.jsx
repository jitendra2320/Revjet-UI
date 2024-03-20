import React, { useEffect } from 'react';
import { SendInvite } from "../../REST/alert";
import { useForm, Controller } from "react-hook-form";
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from "yup";
import {DateTimeControl} from '../../Utils/datetimelocale';
 

export default function FormDialog() {
    const schema = yup.object({
        summary: yup.string().trim().required(),
        description: yup.string().trim().required(),
        location: yup.string().trim().required(),
        start: yup.date().required(),
        end: yup.date().required(),
        emails: yup.string().trim().required()
    }).required();

    const {register, control, handleSubmit, formState: { errors }, clearErrors, reset } = useForm({
        defaultValues: {
            summary: '',
            description: '',
            location: '',
            emails: '',
            start: '',
            end: '',
            emails: ''

        },
        resolver: yupResolver(schema)
    });

    useEffect(() => {
        clearErrors()
        reset()
    }, [clearErrors, reset])

    const onSubmit = (data) => {
        const calendar = {
            start: data.start,
            end: data.end,
            summary: data.summary,
            description: data.description,
            location: data.location,
            url: 'https://leasing.revjet360.com',
            organizer: {
                name: 'RevJet Administrator',
                email: 'admin@delasoftsupport.com'
            },
        }

        const invite = { emails: data.emails.split(','), calendar, title: data.summary, content: data.description, name: 'Meeting Invite' }
        SendInvite(invite)
    }

    const isError = (val) => val !== undefined && val !== null && typeof val === 'object'


    return <div className='row'>
        <div className='col-4' />
        <div className='col-4'>
            <h2 className='text-center'>Send Invite</h2>
            
                <Controller name="summary" control={control} render={({ field }) => <TextField margin='dense' error={isError(errors.name)} helperText={errors.name && errors.name.message} fullWidth label='Title' {...field} />} />
                <Controller name="description" control={control} render={({ field }) => <TextField margin='dense' error={isError(errors.description)} helperText={errors.description && errors.description.message} fullWidth label='Description' {...field} />} />
                <Controller name="location" control={control} render={({ field }) => <TextField margin='dense' error={isError(errors.location)} helperText={errors.location && errors.location.message} fullWidth label='Location' {...field} />} />
                <div className='row'>
                    <div className='col'>
                       
                        <Controller name="start"    control={control} label={"Start Date"}
                       render={({ field }) => 
                            <DateTimeControl label={"Start Date"} register={register}  errors={errors} field={field} />} />
                    </div>
                    <div className='col'>
                    <Controller name="end"    control={control} labe={"End Date"}
                       render={({ field }) => 
                            <DateTimeControl label={"Start Date"} register={register}  errors={errors} field={field} />} />
                        
                    </div>
                </div>
                <Controller name="emails" control={control} render={({ field }) => <TextField margin='dense' error={isError(errors.emails)} helperText={errors.emails && errors.emails.message} fullWidth label='Emails' {...field} />} />
                <Button fullWidth variant='outlined' onClick={handleSubmit(onSubmit)}>Submit</Button>
             
        </div>
    </div>
}

