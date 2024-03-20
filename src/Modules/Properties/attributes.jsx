import React, { Fragment, useState, useEffect } from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from "yup";
import Divider from '@mui/material/Divider';
import { GetPropertyAttrs, AddPropertyAttr } from '../../REST/properties'
import { useForm, Controller } from "react-hook-form";
import TextField from '@mui/material/TextField';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import EditIcon from '@mui/icons-material/Edit';
import BackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';

export default function PropertyAttributes() {
    const [data, setData] = useState([])
    const [mode, setMode] = useState(0)
    const [refresh, setRefresh] = useState(false)
    const navigate = useNavigate()
    const [rowData, setRowData] = useState({
        name: '',
        description: '',
        attributeType: '',
        allowFiltering: false,
        allowSorting: false
    })

    const schema = yup.object({
        name: yup.string().trim().required(),
        attributeType: yup.string().trim().required(),
        description: yup.string().trim().required()
    }).required();

    const { clearErrors, reset } = useForm({
        defaultValues: {
            name: '',
            attributeType: yup.string().trim().required(),
            description: ''
        },
        resolver: yupResolver(schema)
    });

    useEffect(() => {
        clearErrors()
        reset()
    }, [clearErrors, reset])

    const toggleRefresh = () => setRefresh(!refresh)

    useEffect(() => {
        (async () => {
            const result = await GetPropertyAttrs()
            setData(result.data)
            setMode(0)
        })()
    }, [refresh])

    const handleMode = setMode

    const handleData = (data) => {
        (async () => {
            await AddPropertyAttr(data)
            toggleRefresh()
        })()
    }

    const handleEdit = (value) => {
        setRowData(value)
        handleMode(-1)
    }

    const handleAdd = () => {
        setRowData({
            name: '',
            description: '',
            attributeType: '',
            allowFiltering: false,
            allowSorting: false
        })
        handleMode(-1)
    }

    return <Fragment>
        <Button style={{ float: 'right' }} variant='outlined' onClick={() => navigate(-1)} startIcon={<BackIcon />}>Back</Button>
        <FormDialog open={mode !== 0} data={mode} handleClose={() => handleMode(0)} handleSave={handleData} attrData={rowData} />
        <List sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
            <Divider />
            <ListItem button>
                <ListItemButton onClick={() => handleAdd()} dense>
                    <ListItemText primary={`Add Property Attribute`} />
                </ListItemButton></ListItem>
            <Divider />
            {data.map((value, idx) => {
                return (<Fragment key={idx}>
                    <ListItem
                        secondaryAction={
                            <IconButton onClick={() => handleEdit(value)} edge="end">
                                <EditIcon />
                            </IconButton>
                        }>
                        <ListItemButton dense>
                            <ListItemText primary={`${value.name}`} />
                        </ListItemButton>
                    </ListItem>
                    <Divider />
                </Fragment>
                );
            })}
        </List>
    </Fragment>
}


function FormDialog({ open = false, data, handleClose, handleSave, attrData }) {
    const schema = yup.object({
        name: yup.string().trim().required(),
        description: yup.string().trim().required(),
        attributeType: yup.string().trim().required()
    }).required();

    const { control, handleSubmit, formState: { errors }, clearErrors, reset } = useForm({
        defaultValues: {
            name: '',
            description: '',
            attributeType: '',
            allowFiltering: false,
            allowSorting: false
        },
        resolver: yupResolver(schema)
    });

    useEffect(() => {
        if (attrData) {
            const { name, description, attributeType, allowFiltering, allowSorting } = attrData
            reset({ name, description, attributeType, allowFiltering, allowSorting });
        }
    }, [attrData, reset]);

    useEffect(() => {
        clearErrors()
        reset()
    }, [open, clearErrors, reset])

    const onSubmit = handleSave

    const isError = (val) => val !== undefined && val !== null && typeof val === 'object'

    const getOptions = (opts = ['Text', 'Numeric', 'Date']) => {
        return [<option key='temp'>Select One</option>].concat(opts.map((e, idx) => {
            return <option key={idx} value={e}>{e}</option>
        }))
    }


    return <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Property Attribute</DialogTitle>
        <DialogContent>
            <DialogContentText>&nbsp;</DialogContentText>
            <Controller name="name" control={control} render={({ field }) => <TextField margin='dense' error={isError(errors.name)} helperText={errors.name && errors.name.message} fullWidth label='Name' {...field} />} />
            <Controller name="description" control={control} render={({ field }) => <TextField margin='dense' error={isError(errors.description)} helperText={errors.description && errors.description.message} fullWidth label='Description' {...field} />} />
            <Controller name="attributeType" control={control} render={({ field }) => <FormControl error={isError(errors.attributeType)} variant='standard' required margin='dense' fullWidth><InputLabel shrink >Attribute Type</InputLabel><NativeSelect {...field} >{getOptions()}</NativeSelect>{errors.attributeType && <FormHelperText>{errors.attributeType.message}</FormHelperText>}</FormControl>} />
            <Controller name="allowFiltering" control={control} render={({ field }) => <FormControlLabel {...field} control={<Checkbox checked={field.value} />} label="Allow Filtering" />} />
            <Controller name="allowSorting" control={control} render={({ field }) => <FormControlLabel {...field} control={<Checkbox checked={field.value} />} label="Allow Sorting" />} />
        </DialogContent>
        <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button onClick={handleSubmit(onSubmit)}>Save</Button>
        </DialogActions>
    </Dialog>
}