import React, { useEffect } from 'react'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField';
import { useForm, Controller } from "react-hook-form";
import CloseIcon from '@mui/icons-material/Close';
import Dialog from '@mui/material/Dialog';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from "yup";
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Slide from '@mui/material/Slide';
import { SendNotices } from '../../REST/utilities';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';


const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

export default function Notices({ tmpltKey, entity, title }) {
    const [open, setOpen] = React.useState(false);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const schema = yup.object({
        subject: yup.string().trim().required(),
        email: yup.string().email().required()
    }).required();

    const { control, handleSubmit, formState: { errors }, clearErrors, reset } = useForm({
        defaultValues: {
            subject: '',
            email: ''
        },
        resolver: yupResolver(schema)
    });

    useEffect(() => {
        clearErrors()
        reset()
    }, [open, clearErrors, reset])

    const onSubmit = (data) => {
        let val = { key: tmpltKey, entity, title: data.subject, email: data.email }
        SendNotices(val).then(res => {
        })
        setOpen(false);

    }

    const isError = (val) => val !== undefined && val !== null && typeof val === 'object'

    return (
        <div>
            <Button variant="outlined" startIcon={<ContentCopyIcon />} onClick={handleClickOpen}>
                {title}
            </Button>
            <Dialog
                fullScreen
                open={open}
                onClose={handleClose}
                TransitionComponent={Transition}
            >
                <AppBar sx={{ position: 'relative' }}>
                    <Toolbar>
                        <IconButton
                            edge="start"
                            color="inherit"
                            onClick={handleClose}
                            aria-label="close"
                        >
                            <CloseIcon />
                        </IconButton>
                        <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
                            {title}
                        </Typography>
                    </Toolbar>
                </AppBar>
                <div className='row'>
                    <div className='col-lg-3 col-md-4 col-sm-6 col-xs-12 mx-auto'>
                        <Controller name="subject" control={control} render={({ field }) => <TextField margin='dense' variant='standard' error={isError(errors.subject)} helperText={errors.subject && errors.subject.message} fullWidth label='Email Subject' {...field} />} />
                        <Controller name="email" control={control} render={({ field }) => <TextField margin='dense' variant='standard' error={isError(errors.email)} helperText={errors.email && errors.email.message} fullWidth label='Email' {...field} />} />
                        <Button variant='outlined' onClick={handleSubmit(onSubmit)}>Send Email</Button>
                    </div>
                </div>
            </Dialog>
        </div>
    );
}