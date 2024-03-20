import React, { Fragment, useState, useEffect } from 'react';
import { GetInvoiceCycles, AddInvoiceCyle, DeleteInvoiceCycle } from "../../REST/utilities";
import { useForm, Controller } from "react-hook-form";
import TextField from '@mui/material/TextField';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from "yup";
import Divider from '@mui/material/Divider';
import Cron from 'react-cron-generator'
import 'react-cron-generator/dist/cron-builder.css'
import cronstrue from 'cronstrue';
import BackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';


export default function InvoiceCycles() {
    const [data, setData] = useState([])
    const [mode, setMode] = useState(0)
    const [refresh, setRefresh] = useState(false)
    const navigate = useNavigate()

    const toggleRefresh = () => setRefresh(refresh => !refresh)

    useEffect(() => {
        toggleRefresh()
    }, [])

    useEffect(() => {
        (async () => {
            const result = await GetInvoiceCycles()
            setData(result.data)
            setMode(0)
        })()
    }, [refresh])

    const handleMode = setMode

    const handleData = (data) => {
        (async () => {
            await AddInvoiceCyle({ ...data, dueDays: Number(data.dueDays) })
            toggleRefresh()
        })()
    }

    const handleDelete = (id) => {
        (async () => {
            await DeleteInvoiceCycle(id)
            toggleRefresh()
        })()
    }

    const getDesc = (val) => {
        try {
            return cronstrue.toString(val);
        }
        catch (ex) {
            console.log(ex, val)
            return 'NA'
        }
    }

    return <Fragment>
        <Button style={{ float: 'right' }} variant='outlined' onClick={() => navigate(-1)} startIcon={<BackIcon />}>Back</Button>
        <FormDialog open={mode !== 0} data={mode} handleClose={() => handleMode(0)} handleSave={handleData} />
        <List sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
            <Divider />
            <ListItem button>
                <ListItemButton onClick={() => handleMode(-1)} dense>
                    <ListItemText primary={`Add Invoice Cycle`} />
                </ListItemButton></ListItem>
            <Divider />
            {data.map((value, idx) => {
                return (<Fragment key={idx}>
                    <ListItem

                        secondaryAction={
                            <IconButton onClick={() => handleDelete(value._id)} edge="end">
                                <DeleteIcon />
                            </IconButton>
                        }>
                        <ListItemButton dense>
                            <ListItemText secondary={`${getDesc(value.expression)}`} primary={`${value.name}`} />
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
        expression: yup.string().trim().required()
    }).required();

    const { control, handleSubmit, formState: { errors }, clearErrors, reset } = useForm({
        defaultValues: {
            name: '',
            description: '',
            dueDays: '',
            expression: ''
        },
        resolver: yupResolver(schema)
    });

    useEffect(() => {
        clearErrors()
        reset()
    }, [open, clearErrors, reset])

    const onSubmit = handleSave

    const isError = (val) => val !== undefined && val !== null && typeof val === 'object'


    return <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Invoice Cycles </DialogTitle>
        <DialogContent>
            <DialogContentText>&nbsp;</DialogContentText>
            <Controller name="name" control={control} render={({ field }) => <TextField margin='dense' error={isError(errors.name)} helperText={errors.name && errors.name.message} fullWidth label='Name' {...field} />} />
            <Controller name="description" control={control} render={({ field }) => <TextField margin='dense' error={isError(errors.description)} helperText={errors.description && errors.description.message} fullWidth label='Description' {...field} />} />
            <Controller name="dueDays" control={control} render={({ field }) => <TextField margin='dense' type="number"
                error={isError(errors.dueDays)} helperText={errors.dueDays && errors.dueDays.message} fullWidth label='Due Days' {...field} />} />
            <Controller name="expression" control={control} render={({ field }) => <CronInput errors={errors} field={field} />} />
        </DialogContent>
        <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button onClick={handleSubmit(onSubmit)}>Save</Button>
        </DialogActions>
    </Dialog>
}

function CronInput({ errors, field }) {

    console.log(field)

    return <Fragment>
        <Cron {...field} showResultText={true}
            showResultCron={true} />
        <span>
        </span>
    </Fragment>
}