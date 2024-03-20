import React, { useEffect } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { AddSecurityDeposit } from "../../REST/agreements";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from "yup";
import { getOptions } from './index'
import { useParams } from 'react-router-dom';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import NativeSelect from '@mui/material/NativeSelect';
import FormHelperText from '@mui/material/FormHelperText';
import {DateTimeControl} from '../../Utils/datetimelocale';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';

const schema = yup.object({
    amount: yup.number().required(),
    received: yup.boolean(),
    returned: yup.boolean(),
    paymentDate: yup.string(),
    returnDate: yup.string(),
    paymentMethod: yup.string(),
    returnDesc: yup.string()
})

export default function SecurityDeposit({ propertyId, data, toggleRefresh }) {
    const { id } = useParams()
    const [open, setOpen] = React.useState(false);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const { register,control, handleSubmit, formState: { errors }, clearErrors, reset } = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            amount: '',
            received: false,
            returned: false,
            paymentDate: '',
            returnDate: '',
            paymentMethod: '',
            returnDesc: ''
        }
    });

    const onSubmit = data => {
        (async () => {
            await AddSecurityDeposit(id, propertyId, data).then(handleClose)
            toggleRefresh()
        })()
    }

    useEffect(() => {
        clearErrors()
        reset()
    }, [clearErrors, reset])

    useEffect(() => {
        reset(data)
    }, [data, reset])

    const isError = (val) => val !== undefined && val !== null && typeof val === 'object'

    return (
        <React.Fragment>
            <Button variant="outlined" startIcon={<AccountBalanceWalletIcon />} onClick={handleClickOpen}>
                Security Deposit
            </Button>
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Security Deposit</DialogTitle>
                <DialogContent>
                 
                        <Controller name="amount" control={control} render={({ field }) => <TextField variant='standard' margin='dense' disabled={(data && data.amount) ? true : false} error={isError(errors.amount)} helperText={errors.amount && errors.amount.message} fullWidth label='Deposit Amount' {...field} />} type='number' />
                        <Controller name="received" control={control} render={({ field }) => <FormControlLabel {...field} disabled={(data && data.received) ? true : false} control={<Checkbox checked={field.value} />} label="Received" />} />
                        <Controller name="returned" control={control} render={({ field }) => <FormControlLabel {...field} control={<Checkbox checked={field.value} />} label="Returned" />} />
                        <br />
                        <Controller name="paymentDate"    control={control} 
                       render={({ field }) => 
                            <DateTimeControl label={"Payment Date"} register={register}  errors={errors} field={field} />} />
                        <Controller name="returnDate"    control={control} 
                       render={({ field }) => 
                            <DateTimeControl label={"Return Date"} register={register}  errors={errors} field={field} />} />
                        <Controller name="paymentMethod" control={control} render={({ field }) => <FormControl error={isError(errors.paymentMethod)} disabled={(data && data.paymentMethod) ? true : false} variant='standard' margin='dense' fullWidth><InputLabel shrink>Payment Method</InputLabel><NativeSelect {...field} >{getOptions(['Cash', 'Check', 'Card'])}</NativeSelect>{errors.paymentMethod && <FormHelperText>{errors.paymentMethod.message}</FormHelperText>}</FormControl>} />
                        <Controller name="returnDesc" control={control} render={({ field }) => <TextField variant='standard' margin='dense' error={isError(errors.returnDesc)} helperText={errors.returnDesc && errors.returnDesc.message} fullWidth label='Return Description' {...field} />} />
                     
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button onClick={handleSubmit(onSubmit)}>Save</Button>
                </DialogActions>
            </Dialog>
        </React.Fragment>
    );
}
