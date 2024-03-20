import React, { Fragment, useState, useEffect } from 'react';
import { AddAccount, GetAccount } from "../../REST/utilities";
import { useForm, Controller } from "react-hook-form";
import TextField from '@mui/material/TextField';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from "yup";
import Divider from '@mui/material/Divider';
import BackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';

export default function Accounts() {
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
            const result = await GetAccount()
            setData(result.data)
            setMode(0)
        })()
    }, [refresh])

    const handleMode = setMode

    const handleData = (data) => {
        (async () => {
            await AddAccount(data)
            toggleRefresh()
        })()
    }


    return <Fragment>
        <Button style={{ float: 'right' }} variant='outlined' onClick={() => navigate(-1)} startIcon={<BackIcon />}>Back</Button>
        <FormDialog open={mode !== 0} data={mode} handleClose={() => handleMode(0)} handleSave={handleData} />
        <List sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
            <Divider />
            <ListItem button>
                <ListItemButton onClick={() => handleMode(-1)} dense>
                    <ListItemText primary={`Add Account`} />
                </ListItemButton></ListItem>
            <Divider />
            {data.map((value, idx) => {
                return (<Fragment key={idx}>
                    <ListItem>
                        <ListItemButton dense>
                            <ListItemText secondary={`${new Date(value.createdAt).toLocaleDateString() + ' ' + new Date(value.createdAt).toLocaleTimeString()}`} primary={`${value.email}`} />
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
        email: yup.string().email().required(),
    }).required();

    const { control, handleSubmit, formState: { errors }, clearErrors, reset } = useForm({
        defaultValues: {
            email: ''
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
        <DialogTitle>Add Internal Account</DialogTitle>
        <DialogContent>
            <DialogContentText>&nbsp;</DialogContentText>
            <Controller name="email" control={control} render={({ field }) => <TextField margin='dense' error={isError(errors.email)} helperText={errors.email && errors.email.message} fullWidth label='Email' {...field} />} />
        </DialogContent>
        <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button onClick={handleSubmit(onSubmit)}>Save</Button>
        </DialogActions>
    </Dialog>
}