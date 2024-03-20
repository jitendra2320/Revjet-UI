import { yupResolver } from '@hookform/resolvers/yup';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import PersonIcon from '@mui/icons-material/Person';
import Radio from '@mui/material/Radio';
import Divider from '@mui/material/Divider';
import AppBar from '@mui/material/AppBar';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import FormControlLabel from '@mui/material/FormControlLabel';
import IconButton from '@mui/material/IconButton';
import RadioGroup from '@mui/material/RadioGroup';
import Slide from '@mui/material/Slide';
import TextField from '@mui/material/TextField';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import {
    gridClasses, GridToolbarContainer,
    GridToolbarExport
} from '@mui/x-data-grid';
import React, { Fragment, useEffect, useState } from 'react';
import { Controller, useForm } from "react-hook-form";
import { useParams } from 'react-router-dom';
import * as yup from "yup";
import { CreateUser, GetUsers, UpdateUser } from '../../REST/company';

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});


function CustomToolbar() {
    return (
        <GridToolbarContainer className={gridClasses.toolbarContainer}>
            <GridToolbarExport />
        </GridToolbarContainer>
    );
}

export default function Users() {
    const [rows, setRows] = useState([])
    const [open, setOpen] = useState(false);
    const [add, setAdd] = useState(false)
    const [page, setPage] = useState(10)
    const { id } = useParams()
    const [refresh, setRefresh] = useState(false);

    const toggleRefresh = () => setRefresh(r => !r)
    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };


    const columns = [
        { field: 'id', headerName: 'ID', flex: 0.5, hide: true },
        { field: 'email', headerName: 'Email', flex: 0.5 },
        { field: 'enable', headerName: 'Activate?', flex: 0.5 },
    ];


    useEffect(() => {
        GetData()
    }, [refresh, id])

    const GetData = () => {
        (async () => {
            const res = await GetUsers(id)
            setRows(res.data.map(e => {
                return { ...e, id: e._id }
            }))
        })()
    }

    const handleEnable = (each) => {
        (async () => {
            const res = await UpdateUser(each.id, each)
            if (res)
                GetData()
        })()
    }

    // const handleLink = (id) => navigate('/agreements/' + id)

    return (
        <Fragment>
            <Button variant="outlined" startIcon={<PersonIcon />} onClick={handleClickOpen}>
                Users
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
                            Users
                        </Typography>
                        <IconButton
                            size="large"
                            edge="end"
                            color="inherit"
                            aria-label="menu"
                            sx={{ mr: 2 }}
                            onClick={() => setAdd(true)}
                        >
                            <AddIcon />
                        </IconButton>
                    </Toolbar>
                </AppBar>
                <div style={{ flexGrow: 1 }}>
                    {add && <AddUser open={add} handleClose={() => setAdd(false)} toggleRefresh={toggleRefresh} />}
                    <div className='col-12'>
                        {(rows || []).map(each => {
                            return <div key={each.id} className='row col-12 m-3'>
                                <label className='col-6 '>{each.email}</label>
                                <RadioGroup
                                    className='col-6 '
                                    row
                                    value={each.enable}
                                    onChange={() => handleEnable(each)}
                                >
                                    <FormControlLabel value={true} control={<Radio />} label="Enabled" />
                                    <FormControlLabel value={false} control={<Radio />} label="Disabled" />
                                </RadioGroup>
                                <Divider />
                            </div>
                        })}
                    </div>
                    {/* <DataGrid
                        rows={rows}
                        columns={columns}
                        pageSize={page}
                        rowsPerPageOptions={[10, 15, 25]}
                        onPageSizeChange={e => setPage(e)}
                        components={{
                            Toolbar: CustomToolbar,
                        }}
                    // onRowClick={(p) => handleLink(p.id)}
                    /> */}
                </div>
            </Dialog>

        </Fragment>
    );
}


function AddUser({ open = false, handleClose, toggleRefresh }) {
    const { id } = useParams()

    const schema = yup.object({
        email: yup.string().email().required()
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

    const onSubmit = (data) => {
        (async () => {
            await CreateUser(id, data)
            handleClose()
            toggleRefresh()
        })()
    }

    const isError = (val) => val !== undefined && val !== null && typeof val === 'object'


    return <Dialog open={open} onClose={handleClose}>
        <DialogTitle> Add User </DialogTitle>
        <DialogContent>
            <DialogContentText>&nbsp;</DialogContentText>
            <Controller name="email" control={control} render={({ field }) => <TextField variant='standard' margin='dense' error={isError(errors.email)} helperText={errors.email && errors.email.message} fullWidth label='Email' {...field} />} />
        </DialogContent>
        <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button onClick={handleSubmit(onSubmit)}>Save</Button>
        </DialogActions>
    </Dialog>
}