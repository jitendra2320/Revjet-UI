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
import { GetPropertyTypes, AddPropertyType, GetPropertyAttrs, UpdatePropertyType, RemovePropertyType } from '../../REST/properties'
import { useForm, Controller } from "react-hook-form";
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import EditIcon from '@mui/icons-material/Edit';
import BackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import DeleteIcon from '@mui/icons-material/Delete';

export default function PropertyTypes() {
    const [data, setData] = useState([])
    const [mode, setMode] = useState(0)
    const [refresh, setRefresh] = useState(false)
    const [attrs, setAttrs] = useState([])
    const navigate = useNavigate()
    const [rowData, setRowData] = useState({
        name: '',
        attributes: []
    })
    const [isEdit, setIsEdit] = useState(null)

    const schema = yup.object({
        name: yup.string().trim().required(),
    }).required();

    const { clearErrors, reset } = useForm({
        defaultValues: {
            name: '',
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
            const result = await GetPropertyTypes()
            const attributes = await GetPropertyAttrs()
            setData(result.data)
            setAttrs(attributes.data)
            setMode(0)
        })()
    }, [refresh])

    const handleMode = setMode

    const handleData = (data) => {
        const options = document.getElementById('attrsSelect').selectedOptions
        const values = Array.from(options).map(({ value }) => value);
        if (isEdit) {
            (async () => {
                await UpdatePropertyType(isEdit, { ...data, attributes: values })
                toggleRefresh()
                setIsEdit(null)
            })()
        }
        else {
            (async () => {
                await AddPropertyType({ ...data, attributes: values })
                toggleRefresh()
            })()
        }


    }

    const handleEdit = (value) => {
        setIsEdit(value._id)
        setRowData(value)
        handleMode(-1)
    }

    const handleDelete = (value) => {
        (async () => {
            await RemovePropertyType(value._id)
            toggleRefresh()
        })()
    }

    return <Fragment>
        <Button style={{ float: 'right' }} variant='outlined' onClick={() => navigate(-1)} startIcon={<BackIcon />}>Back</Button>
        <FormDialog open={mode !== 0} data={mode} handleClose={() => handleMode(0)} handleSave={handleData} attrs={attrs} prpData={rowData} />
        <List sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
            <ListItem button>
                <ListItemButton onClick={() => handleMode(-1)} dense>
                    <ListItemText primary={`Add Property Type`} />
                </ListItemButton></ListItem>
            <Divider />
            {data.map((value, idx) => {
                return (<Fragment key={idx}>
                    <ListItem

                        secondaryAction={
                            <Fragment>
                                <IconButton onClick={() => handleEdit(value)} style={{ margin: 'auto' }} edge="end">
                                    <EditIcon />
                                </IconButton>
                                <IconButton onClick={() => handleDelete(value)} edge="end">
                                    <DeleteIcon />
                                </IconButton>
                            </Fragment>

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


function FormDialog({ open = false, data, handleClose, handleSave, attrs = [], prpData }) {
    const schema = yup.object({
        name: yup.string().trim().required()
    }).required();

    const { control, handleSubmit, formState: { errors }, clearErrors, reset } = useForm({

        resolver: yupResolver(schema)
    });

    useEffect(() => {
        if (prpData) {
            const { name, attributes } = prpData
            reset({ name: name, attributes: attributes });
        }
    }, [prpData, reset]);

    useEffect(() => {
        clearErrors()
        reset()
    }, [open, clearErrors, reset])

    const onSubmit = handleSave

    const isError = (val) => val !== undefined && val !== null && typeof val === 'object'


    return <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Property Type</DialogTitle>
        <DialogContent>
            <DialogContentText>&nbsp;</DialogContentText>
            <Controller name="name" control={control} render={({ field }) => <TextField margin='dense' error={isError(errors.name)} helperText={errors.name && errors.name.message} fullWidth label='Name' {...field} />} />
            {/* <Controller name="attributes" control={control} render={({ field }) => <Dropdown config={{ values: attrs, labelName: 'name', valueName: '_id', multiple: true }} field={field} />
            } /> */}

            {/* <Dropdown control={control} config={{ values: [], labelName: '', valueName: '' }} /> */}

            <Select margin='dense' multiple native inputProps={{ id: 'attrsSelect' }} defaultValue={prpData.attributes}>
                {attrs.map((e, idx) => {
                    return <option key={idx} value={e._id}>{e.name}</option>
                })}
            </Select>
        </DialogContent>
        <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button onClick={handleSubmit(onSubmit)}>Save</Button>
        </DialogActions>
    </Dialog>
}
