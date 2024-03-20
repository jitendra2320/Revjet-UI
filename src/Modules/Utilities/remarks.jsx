import React, { Fragment, useState, useEffect } from 'react';
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
import { GetRemarks, AddRemark, DeleteRemark, AddRemarkDoc } from '../../REST/utilities'
import { useForm, Controller } from "react-hook-form";
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import NotesIcon from '@mui/icons-material/NoteAdd';
import DocumentView from './documents';
import NoteIcon from '@mui/icons-material/Note';
import Access from '../../Utils/authorize';
import { Typography } from '@mui/material';
import { dateFormat } from '../../helpers/dates'

function Remarks({ docIds = [], onUpload, module }) {
    const [data, setData] = useState([])
    const [mode, setMode] = useState(0)
    const [refresh, setRefresh] = useState(false)

    const toggleRefresh = () => setRefresh(r => !r)

    useEffect(() => {
        (async () => {
            const result = await GetRemarks(docIds)
            setData(result.data)
            setMode(0)
        })()
    }, [refresh, docIds])

    useEffect(() => toggleRefresh, [])

    const handleMode = setMode

    const handleData = (data) => {
        (async () => {
            const result = await AddRemark({ ...data, createdBy: Access.getFullname() })
            onUpload(result.data)
            setMode(0)
            toggleRefresh()
        })()
    }

    const addDocument = (id, doc) => AddRemarkDoc(id, doc).then(toggleRefresh)

    const handleDelete = (id) => DeleteRemark(id).then(toggleRefresh)

    return <Fragment>
        <FormDialog open={mode !== 0} handleClose={() => handleMode(0)} handleSave={handleData} />
        <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
            <ListItem>
                <ListItemButton onClick={() => handleMode(-1)} dense>
                    <ListItemText primary={`Add Remarks`} />
                </ListItemButton></ListItem>
            <Divider />
            {data.map((value, idx) => {
                return (<Fragment key={idx}>
                    <ListItem secondaryAction={
                        <Fragment>
                            {Access.isAdmin(module) && <IconButton onClick={() => handleDelete(value._id)} edge="end">
                                <DeleteIcon />
                            </IconButton>}
                            <DocumentView module={module} icon docIds={value.documents} onUpload={r => addDocument(value._id, r._id)} />
                        </Fragment>
                    }>
                        <ListItemButton dense>
                            <ListItemText
                                secondary={
                                    <Typography>
                                        {value.message}
                                        <br />
                                        {`${dateFormat(value.createdAt)}`}
                                        <br />
                                        Added By: {value.createdBy}
                                    </Typography>
                                }
                                primary={`${value.subject}`}
                            />
                        </ListItemButton>
                    </ListItem>
                    <Divider />
                </Fragment>
                );
            })}
        </List>
    </Fragment>
}


function FormDialog({ open = false, handleClose, handleSave }) {
    const schema = yup.object({
        subject: yup.string().trim().required(),
        message: yup.string().trim().required()
    }).required();

    const { control, handleSubmit, formState: { errors }, clearErrors, reset } = useForm({
        defaultValues: {
            subject: '',
            message: ''
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
        <DialogTitle>Remarks</DialogTitle>
        <DialogContent>
            <DialogContentText>&nbsp;</DialogContentText>
            <Controller name="subject" control={control} render={({ field }) => <TextField margin='dense' error={isError(errors.subject)} helperText={errors.subject && errors.subject.message} fullWidth label='Subject' {...field} />} />
            <Controller name="message" control={control} render={({ field }) => <TextField margin='dense' error={isError(errors.message)} helperText={errors.message && errors.message.message} fullWidth label='Message' {...field} />} />
        </DialogContent>
        <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button onClick={handleSubmit(onSubmit)}>Save</Button>
        </DialogActions>
    </Dialog>
}


export default function RemarksView({ docIds = [], onUpload, icon = false, fullWidth = false, module }) {
    const [open, setOpen] = React.useState(false);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    return (
        <Fragment>
            {!icon && <Button variant="outlined" startIcon={<NoteIcon />} onClick={handleClickOpen}>
                Remarks
            </Button>}
            {icon && <IconButton onClick={handleClickOpen} edge="end">
                <NotesIcon />
            </IconButton>}
            <Dialog open={open} onClose={handleClose} fullWidth={fullWidth}>
                <DialogTitle>Remarks</DialogTitle>
                <DialogContent>
                    <Remarks module={module} onUpload={onUpload} docIds={docIds} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Done</Button>
                </DialogActions>
            </Dialog>
        </Fragment>
    );
}