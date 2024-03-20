import React, { Fragment, useState, useEffect } from 'react';
import { GetSkuTypes, AddSkuType } from "../../REST/utilities";
import { useForm, Controller, useFormState } from "react-hook-form";
import TextField from '@mui/material/TextField';
import NativeSelect from '@mui/material/NativeSelect';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
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
import * as yup from "yup";
import Divider from '@mui/material/Divider';

export default function SkuTypes() {
    const [data, setData] = useState([])
    const [mode, setMode] = useState(0)
    const [refresh, setRefresh] = useState(false)

    const toggleRefresh = () => setRefresh(refresh => !refresh)

    useEffect(() => {
        toggleRefresh()
    }, [])

    useEffect(() => {
        (async () => {
            const result = await GetSkuTypes()
            setData(result.data)
            setMode(0)
        })()
    }, [refresh])

    const handleMode = setMode

    const handleData = (data) => {
        (async () => {
            await AddSkuType(data)
            toggleRefresh()
        })()
    }

    return <Fragment>
        {mode !== 0 && <FormDialog open={mode !== 0} data={mode} handleClose={() => handleMode(0)} handleSave={handleData} />}
        <List sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
            <Divider />
            <ListItem button>
                <ListItemButton onClick={() => handleMode(-1)} dense>
                    <ListItemText primary={`Add Payment Type`} />
                </ListItemButton></ListItem>
            <Divider />
            {data.map((value, idx) => {
                return (<Fragment key={idx}>
                    <ListItem>
                        <ListItemButton dense>
                            <ListItemText primary={`${value.name}`} secondary={value.description} />
                        </ListItemButton>
                    </ListItem>
                    <Divider />
                </Fragment>
                );
            })}
        </List>
    </Fragment>
}

function FormDialog({ open = false, data, handleClose, handleSave }) {
    const schema = yup.object({
        name: yup.string().trim().required(),
        description: yup.string().trim().required(),
        skuType: yup.string().trim().required(),
        skuValue: yup.string().trim().required(),
        lateFee: yup.number().required()
    }).required();

    const { control, handleSubmit, formState: { errors }, clearErrors, reset, getValues } = useForm({
        defaultValues: {
            name: '',
            description: '',
            skuType: '',
            skuValue: '',
            lateFee: 0
        },
        resolver: yupResolver(schema)
    });

    const { isDirty } = useFormState({ control })

    useEffect(() => {
        clearErrors()
        reset()
    }, [open, clearErrors, reset])

    useEffect(() => {
        reset(getValues())
    }, [isDirty, getValues, reset])

    const onSubmit = handleSave

    const isError = (val) => val !== undefined && val !== null && typeof val === 'object'

    const getOptions = () => {
        return <Fragment>
            <option>Please Select</option>
            <option value='CPI'>CPI Based</option>
            <option value='Flat'>Flat Rate</option>
            <option value='Percent'>Percent Based</option>
        </Fragment>
    }

    const getLabel = (val) => {
        if (val === 'CPI') {
            return 'CPI Series'
        }
        else if (val === 'Flat') {
            return 'Flat Rate (%)'
        }
        else if (val === 'Percent') {
            return 'Percentage'
        }
        return ''
    }

    return <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Payment Types</DialogTitle>
        <DialogContent>
            <DialogContentText>&nbsp;</DialogContentText>
            <Controller name="name" control={control} render={({ field }) => <TextField margin='dense' error={isError(errors.name)} helperText={errors.name && errors.name.message} fullWidth label='Name' {...field} />} />
            <Controller name="description" control={control} render={({ field }) => <TextField margin='dense' error={isError(errors.description)} helperText={errors.description && errors.description.message} fullWidth label='Description' {...field} />} />
            <Controller name="skuType" control={control} render={({ field }) => <FormControl error={isError(errors.skuType)} variant='standard' margin='dense' fullWidth><InputLabel shrink >Sku Type</InputLabel><NativeSelect {...field} >{getOptions()}</NativeSelect>{errors.skuType && <FormHelperText>{errors.skuType.message}</FormHelperText>}</FormControl>} />
            <Controller name="skuValue" control={control} render={({ field }) => <TextField margin='dense' error={isError(errors.skuValue)} helperText={errors.skuValue && errors.skuValue.message} fullWidth label={getLabel(getValues('skuType'))} {...field} />} />
            <Controller name="lateFee" control={control} render={({ field }) => <TextField type={'number'} margin='dense' error={isError(errors.lateFee)} helperText={errors.lateFee && errors.lateFee.message} fullWidth label='Late Fee (In %)' {...field} />} />
        </DialogContent>
        <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button onClick={handleSubmit(onSubmit)}>Save</Button>
        </DialogActions>
    </Dialog>
}