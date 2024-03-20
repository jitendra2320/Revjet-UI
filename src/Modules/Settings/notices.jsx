import React, { Fragment, useState, useEffect, useRef, forwardRef } from 'react';
import { GetNotices, AddNotice, RemoveNotice, GetNoticeFields } from "../../REST/utilities";
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
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import Slide from '@mui/material/Slide';
import BackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';

export default function Notices() {
    const [data, setData] = useState([])
    const [mode, setMode] = useState(0)
    const [refresh, setRefresh] = useState(false)
    const [fields, setFields] = useState([])
    const navigate = useNavigate()


    const toggleRefresh = () => setRefresh(refresh => !refresh)

    useEffect(() => {
        toggleRefresh()
    }, [])

    useEffect(() => {
        (async () => {
            const result = await GetNotices()
            const fields = await GetNoticeFields()
            setData(result.data)
            setFields(fields.data)
            setMode(0)
        })()
    }, [refresh])

    const handleMode = setMode

    const handleData = (data) => {
        (async () => {
            await AddNotice(data)
            toggleRefresh()
        })()
    }

    const handleDelete = (id) => {
        (async () => {
            await RemoveNotice(id)
            toggleRefresh()
        })()
    }

    return <Fragment>
        <Button style={{ float: 'right' }} variant='outlined' onClick={() => navigate(-1)} startIcon={<BackIcon />}>Back</Button>
        {mode !== 0 && <FormDialog open={mode !== 0} data={mode} handleClose={() => handleMode(0)} fields={fields} handleSave={handleData} />}
        <List sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
            <Divider />
            <ListItem button>
                <ListItemButton onClick={() => handleMode(-1)} dense>
                    <ListItemText primary={`Add Notice`} />
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



function FormDialog({ open = false, data, handleClose, handleSave, fields = [] }) {
    const schema = yup.object({
        name: yup.string().trim().required(),
        module: yup.string().trim().required(),
        key: yup.string().trim().required(),
        template: yup.string().trim().required(),
        description: yup.string()
    }).required();

    const { control, handleSubmit, formState: { errors }, clearErrors, reset, getValues } = useForm({
        defaultValues: {
            name: '',
            module: '',
            key: '',
            template: '',
            description: ''
        },
        resolver: yupResolver(schema)
    });

    const { isDirty } = useFormState({ control })

    useEffect(() => {
        clearErrors()
        reset()
    }, [open, clearErrors, reset])

    const onSubmit = handleSave

    const isError = (val) => val !== undefined && val !== null && typeof val === 'object'

    const getOptions = (type) => {
        if (type === 'Modules') {
            return <Fragment>
                <option></option>
                <option>Invoices</option>
                <option>Waitlist</option>
                <option>Company</option>
            </Fragment>
        }
        return <option>NA</option>
    }

    useEffect(() => {
        reset(getValues())
    }, [isDirty, getValues, reset])

    return <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Notice Details</DialogTitle>
        <DialogContent>
            <DialogContentText>&nbsp;</DialogContentText>
            <Controller name="name" control={control} render={({ field }) => <TextField margin='dense' error={isError(errors.name)} helperText={errors.name && errors.name.message} fullWidth label='Name' {...field} />} />
            <Controller name="description" control={control} render={({ field }) => <TextField margin='dense' error={isError(errors.description)} helperText={errors.description && errors.description.message} fullWidth label='Description' {...field} />} />
            <Controller name="key" control={control} render={({ field }) => <TextField margin='dense' error={isError(errors.key)} helperText={errors.key && errors.key.message} fullWidth label='Key' {...field} />} />
            <Controller name="module" control={control} render={({ field }) => <FormControl error={isError(errors.module)} variant='standard' margin='dense' fullWidth><InputLabel shrink >Module</InputLabel><NativeSelect {...field}>{getOptions('Modules')}</NativeSelect>{errors.module && <FormHelperText>{errors.module.message}</FormHelperText>}</FormControl>} />
            <Controller name="template" control={control} render={({ field }) => <TemplateEditor settings={fields} errors={errors} module={getValues('module')} field={field} />} />
        </DialogContent>
        <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button onClick={handleSubmit(onSubmit)}>Save</Button>
        </DialogActions>
    </Dialog>
}

function TemplateEditor({ errors = [], field, settings = [], module = null }) {
    if (module !== '' && module) {
        console.log(settings, module)
        const fields = [settings.find(e => e.name === module)]

        return <DocumentEditorRef label='Template Editor' {...field} fields={fields} />
    }
    return <Fragment></Fragment>
}

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});


function DocumentEditor({ label, value, className, fields = [], onChange }, ref) {
    const [data, setData] = useState('');
    const [open, setOpen] = React.useState(false);
    const [loading, setLoading] = useState(false);
    const frameView = useRef(null);

    const handleClickOpen = () => {
        setOpen(true);
        setLoading(true);
    };

    console.log(fields)

    useEffect(() => {
        if (open === false)
            onChange(data)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open])

    useEffect(() => {
        setData(value)
    }, [value])

    useEffect(() => {
        if (open) {
            const handleSubmit = (data) => {
                setData(data);
                setOpen(false)
            }

            const handleClose = () => {
                setOpen(false);
                setData(value)
            };

            const messageHandler = (message) => {
                console.log(message)
                if (message.origin === process.env.REACT_APP_TEMPLATE_URL) {
                    if (message.data === 'Initialized' && frameView.current && frameView.current.contentWindow) {
                        setLoading(false);

                        frameView.current.contentWindow.postMessage({ render: 'Fields', fields, content: data }, "*")
                    }
                    else if (message.data === 'Close')
                        handleClose()
                    else
                        handleSubmit(message.data)
                }
            }
            window.addEventListener('message', messageHandler)

            return function cleanup() {
                console.log('Cleaned')
                window.removeEventListener('message', messageHandler);
            }
        }
    }, [fields, label, data, value, open])

    return (
        <div className={className || ''}>
            <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={loading} onClick={() => setLoading(false)}><CircularProgress color="inherit" /></Backdrop>
            <Button variant='text' fullWidth color="secondary" onClick={handleClickOpen}>
                {label}
            </Button>
            <Dialog fullScreen open={open} keepMounted={false} TransitionComponent={Transition}>
                <iframe src={process.env.REACT_APP_TEMPLATE_URL} ref={frameView}
                    frameBorder="0"
                    marginHeight="0"
                    marginWidth="0"
                    width="100%"
                    height="100%"
                    title='Template Editor'
                    scrolling="auto">
                </iframe>
            </Dialog>
        </div>
    );
}

const DocumentEditorRef = forwardRef(DocumentEditor)