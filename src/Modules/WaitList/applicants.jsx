import React, { Fragment, useState, useEffect } from 'react';
import { useForm, Controller } from "react-hook-form";
import { GetPropertyTypes } from '../../REST/properties';
import TextField from '@mui/material/TextField';
import NativeSelect from '@mui/material/NativeSelect';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import FormHelperText from '@mui/material/FormHelperText';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { yupResolver } from '@hookform/resolvers/yup';
import { PayCard } from './payment'
import * as yup from "yup";
import { CreateWaitlistInvoice } from '../../REST/invoices'
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt';
import FactIcon from '@mui/icons-material/FactCheck';
import { GetSystemSettings  } from '../../REST/utilities';

export default function WaitList() {
    const [open, setOpen] = useState(false)

    return <Fragment>
        <Button variant='outlined' startIcon={<PersonAddAltIcon />} onClick={() => setOpen(true)}>Join WaitList</Button>
        <Button href={`${process.env.REACT_APP_API_URL}/factsheet/factsheet.pdf`} variant='outlined' startIcon={<FactIcon />} >Property Fact Sheet</Button>
        {open && <JoinWaitList open={open} handleClose={() => setOpen(false)} />}
    </Fragment>
}

function JoinWaitList({ open = false, handleClose }) {
    const isInternal = global.location.hash.indexOf("properties") != -1
    const [types, setTypes] = useState([])
    const [data, setData] = useState(null)
    const [amount,setAmount] = useState(10)
    
    const schema = isInternal ? yup.object({
        propertyType: yup.string().trim().required(),
        firstName: yup.string().trim().required(),
        lastName: yup.string().trim().required(),
        phone: yup.string().trim(),
        email: yup.string().email(),
        organization: yup.string().trim()
    }).required() : 
    yup.object({
        propertyType: yup.string().trim().required(),
        firstName: yup.string().trim().required(),
        lastName: yup.string().trim().required(),
        phone: yup.string().trim().required(),
        email: yup.string().email().required(),
        organization: yup.string().trim().required()
    }).required();

    const { control, handleSubmit, formState: { errors }, clearErrors, reset } = useForm({
        defaultValues: {
            propertyType: '',
            firstName: '',
            lastName: ''
             
        },
        resolver: yupResolver(schema)
    });
    useEffect(()=>{
        GetSystemSettings().then((result)=>{
            const setting = result.data.find((x)=>{ return x.name == "WAITLIST_CHARGE"} )
            if(setting) setAmount(Number(setting.value))

        })
    },[])
    useEffect(() => {
        (async () => {
            const result = await GetPropertyTypes()
            setTypes(result.data)
        })()
    }, [])

    useEffect(() => {
        clearErrors()
        reset()
    }, [clearErrors, reset])

    const onSubmit = (result) => {
        setData(result)
    }
    const onSubmitNoPay= (data)=>{
       
        (async () => {
            const resp =  CreateWaitlistInvoice({}, data)
            console.log(resp.data)
            handleClose()
        })()
    }
    const isError = (val) => val !== undefined && val !== null && typeof val === 'object'

    const getOptions = () => {
        return [<option key={'NA'}>Please Select</option>].concat(types.map(e => {
            return <option key={e._id} value={e._id} > {e.name}</option>
        }))
    }

    const handlePayment = (result) => {
        (async () => {
            const resp = await CreateWaitlistInvoice(result, data)
            console.log(resp.data)
            handleClose()
        })()
    }

    return <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Join Waitlist</DialogTitle>
        <DialogContent>
            <DialogContentText>&nbsp;</DialogContentText>
            {data === null && <Fragment>
                <Controller name="propertyType" control={control} render={({ field }) => <FormControl error={isError(errors.propertyType)} required variant='outlined' margin='dense' fullWidth><InputLabel shrink margin='dense'>Property Type</InputLabel><NativeSelect {...field}>{getOptions()}</NativeSelect>{errors.propertyType && <FormHelperText>{errors.propertyType.message}</FormHelperText>}</FormControl>} />
                <Controller name="firstName" control={control} render={({ field }) => <TextField variant='standard' margin='dense' required error={isError(errors.firstName)} helperText={errors.firstName && errors.firstName.message} fullWidth label='First Name' {...field} />} />
                <Controller name="lastName" control={control} render={({ field }) => <TextField variant='standard' margin='dense' required error={isError(errors.lastName)} helperText={errors.lastName && errors.lastName.message} fullWidth label='Last Name' {...field} />} />
                <Controller name="phone" control={control} render={({ field }) => <TextField variant='standard' margin='dense' required={!isInternal}   error={isError(errors.phone)} helperText={errors.phone && errors.phone.message} fullWidth label='Phone' {...field} />} />
                <Controller name="email" control={control} render={({ field }) => <TextField variant='standard' margin='dense' required={!isInternal}   error={isError(errors.email)} helperText={errors.email && errors.email.message} fullWidth label='Email' {...field} />} />
                <Controller name="organization" control={control} render={({ field }) => <TextField variant='standard' margin='dense' required={!isInternal}   error={isError(errors.organization)} helperText={errors.organization && errors.organization.message} fullWidth label='Organization' {...field} />} />
            </Fragment>}
            {data !== null && amount > 0 && <Fragment>
                <PayCard onComplete={handlePayment} amount={amount} />
            </Fragment>}
        </DialogContent>
        <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            {data === null && amount > 0 && <Button onClick={handleSubmit(onSubmit)}>Pay and Submit</Button>}
            {data === null && amount <= 0 && <Button onClick={handleSubmit(onSubmitNoPay)}>Submit</Button>}
        </DialogActions>
    </Dialog>
}
