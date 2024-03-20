import Button from '@mui/material/Button';
import { useEffect, useState } from 'react';
import { createPayment } from '../../REST/payment';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from "yup";
import { useForm, Controller, useFormState } from "react-hook-form";
import TextField from '@mui/material/TextField';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import {DateTimeControl} from '../../Utils/datetimelocale';

import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Access from '../../Utils/authorize';
 
const paymentKey = process.env.REACT_APP_PAYMENT_KEY
const paymentLocation = process.env.REACT_APP_PAYMENT_LOCATION

export function PayCard({ amount = 0, onComplete }) {
    const [open, setOpen] = useState(false)
    // const [cardPay, setCardPay] = useState(true)
   
    const [method, setMethod] = useState(null) 
    
    useEffect(() => {
       // setTimeout(() => {
            try {
                const payments = window.Square.payments(paymentKey,paymentLocation );
                payments.card().then(card => {
                    card.attach('#card-container').then(res => {
                        setMethod(card)
                        
                    })
                })
            }
            catch (ex) {
                console.log(ex);
            }
        //}, 2000)

    }, [])


    const handlePay = (evt) => {
        method.tokenize().then(tokenResult => {
            createPayment({ locationId: paymentLocation,
                         sourceId: tokenResult.token, amount:  amount  }).then(resp => {
                if (typeof onComplete === 'function')
                    onComplete(resp.data)
            })
        })
    }

    return <div className='row'>
        <div className='col-12 bg-white'>
            <div id='card-container'></div>
            <Button color='primary' fullWidth size='large' variant='contained' onClick={handlePay}><b>Pay With Card</b>&nbsp;${amount.toFixed(2)}</Button>
            <div className='w-100' style={{ height: 5 }} />
            {Access.isAdmin('Invoices') && <Button color='primary' fullWidth size='large' variant='contained' onClick={() => setOpen(true)}><b>Manual Payment</b>&nbsp;${amount.toFixed(2)}</Button>}        </div>
        {open && <PaymentDialog open={open} amount={amount} onComplete={onComplete} handleClose={() => setOpen(false)} />}
    </div>
}

const schema = yup.object({
    confirmation: yup.string().trim().required(),
    accountDetails: yup.string().trim().required(),
    accountName: yup.string().trim().required(),
    paymentDate: yup.date().required()
})


function PaymentDialog({ amount, open = false, onComplete, handleClose }) {
    //const [method, setMethod] = useState(null)

    const {register, control, handleSubmit, formState: { errors }, clearErrors, reset, getValues } = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            accountType: true,
            confirmation: '',
            accountDetails: '',
            accountName: '',
            paymentDate: ''
        }
    });

    const checklabels = {
        accountName: 'Account Name',
        accountDetails: 'Account Number',
        confirmation: 'Routing Number',

    }

    const cashlabels = {
        accountName: 'Paid By',
        accountDetails: 'Cash Details',
        confirmation: 'Comments',
    }

    const isError = (val) => val !== undefined && val !== null && typeof val === 'object'

    const { isDirty } = useFormState({ control })

    useEffect(() => {
        clearErrors()
    }, [clearErrors])

    useEffect(() => {
        reset(getValues())
    }, [isDirty, getValues, reset])

    const handleManual = (data) => {
        onComplete(data)
        handleClose()
    }
    return <Dialog open={open} onClose={handleClose}>
        <DialogTitle> Payment </DialogTitle>
        <DialogContent>
           
                <Controller name="accountType" control={control} render={({ field }) => <FormControlLabel {...field} labelPlacement={getValues('accountType') ? 'start' : 'end'} control={<Switch checked={field.value} />} label={getValues('accountType') ? 'Cash' : 'Check'} />} />
                <Controller name="accountName" control={control} render={({ field }) => <TextField variant='standard' margin='dense' error={isError(errors.accountName)} helperText={errors.accountName && errors.accountName.message} fullWidth label={getValues('accountType') ? cashlabels.accountName : checklabels.accountName} {...field} />} />
                <Controller name="accountDetails" control={control} render={({ field }) => <TextField variant='standard' margin='dense' type={getValues('accountType') ? "string" : "number"} error={isError(errors.accountDetails)} helperText={errors.accountDetails && errors.accountDetails.message} fullWidth label={getValues('accountType') ? cashlabels.accountDetails : checklabels.accountDetails} {...field} />} />
                <Controller name="confirmation" control={control} render={({ field }) => <TextField variant='standard' margin='dense' type={getValues('accountType') ? "string" : "number"} error={isError(errors.confirmation)} helperText={errors.confirmation && errors.confirmation.message} fullWidth label={getValues('accountType') ? cashlabels.confirmation : checklabels.confirmation} {...field} />} />
                <Controller name="paymentDate"    control={control} label='Payment Date'
                       render={({ field }) => 
                            <DateTimeControl register={register}  errors={errors} field={field} />} />
        </DialogContent>
        <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button onClick={handleSubmit(handleManual)}>Save</Button>
        </DialogActions>
    </Dialog>
}

export function PayACH({ amount, accountHolderName, onComplete }) {
    const [method, setMethod] = useState(null)
    const [allow, setAllow] = useState(false)

    useEffect(() => {
        setTimeout(() => {
            try {
                const payments = window.Square.payments('sandbox-sq0idb-meaeueTcCRotc79-w2ceAQ', 'T4RQW80D67TJW');
                payments.ach().then(ach => {
                    setMethod(ach)
                    setAllow(true)
                })
            }
            catch (ex) {
                console.log(ex);
            }
        }, 2000)

    }, [])

    const handlePay = (evt) => {
        const options = { accountHolderName }
        method.tokenize(options).then(tokenResult => {
            createPayment({ locationId: 'T4RQW80D67TJW', sourceId: tokenResult.token, amount: amount * 1000 }).then(resp => {
                if (typeof onComplete === 'function')
                    onComplete(resp.data)
            })
        })
    }

    return <div className='row'>
        <div className='col-12 bg-white'>
            <Button disabled={!allow} color='primary' fullWidth size='large' variant='contained' onClick={handlePay}><b>Pay With Bank Account</b></Button>
        </div>
    </div >
}


export function PayManual({ amount, onComplete }) {
    const handleClick = () => {
        if (typeof onComplete === 'function')
            onComplete()
    }

    return <Button color='primary' fullWidth size='large' onClick={handleClick} variant='contained'><b>Manual Payment for ${amount}</b></Button>
}