import React, { Fragment, useEffect, useState } from 'react'
import Button from '@mui/material/Button'
import {
    GetCompanies, AddCompany, GetCompanyById, AddDocument, AddRemark, UpdateCompany, GetCompanyInvoices, GetCompanyAgreements,
    GetCompanyBalances, AddBalance
} from '../../REST/company'
import {
    DataGrid, GridToolbarContainer,
    GridToolbarExport,
    gridClasses,
} from '@mui/x-data-grid';
import { Routes, Route, useNavigate, useLocation, useParams } from 'react-router-dom'
import AuthProvider from '../Authentication/authProvider'
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from "yup";
import { useForm, Controller, useFormState } from "react-hook-form";
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import ButtonGroup from '@mui/material/ButtonGroup';
import DocumentView from '../Utilities/documents';
import RemarksView from '../Utilities/remarks';
import SaveIcon from '@mui/icons-material/Save';
import ReceiptIcon from '@mui/icons-material/Receipt';
import ArticleIcon from '@mui/icons-material/Article';
import Access from '../../Utils/authorize';
import Users from './users';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import { getOptions } from '../Agreements'
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import NativeSelect from '@mui/material/NativeSelect';
import FormHelperText from '@mui/material/FormHelperText';
import Dialog from '@mui/material/Dialog';
import CloseIcon from '@mui/icons-material/Close';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Slide from '@mui/material/Slide';
import Balances from './balances'
import BackIcon from '@mui/icons-material/ArrowBack';
import { getAmount } from '../../helpers/amount';
import { dateFormat } from '../../helpers/dates';
import {DateTimeControl} from '../../Utils/datetimelocale';

import Switch from '@mui/material/Switch';
import { handleErr } from '../../helpers/errors';
import AddIcon from '@mui/icons-material/Add'
import { dateCompare } from '../../helpers/dates';
const phoneRegExp = /^(\s*|\d+)$/

function CustomToolbar() {
    return (
        <GridToolbarContainer className={gridClasses.toolbarContainer}>
            <GridToolbarExport />
        </GridToolbarContainer>
    );
}

function CompanyList() {

    const navigate = useNavigate()
    const [rows, setRows] = useState([])
    const [page, setPage] = useState(10)

    const columns = [
        { field: 'id', headerName: 'ID', flex: 0.5, hide: true},
        { field: 'name', headerName: 'Name', flex: 0.5},
        { field: 'description', headerName: 'Description', flex: 0.5},
       /* { field: 'address1', headerName: 'Business Address', flex: 0.5},*/
        { field: 'email', headerName: 'Email',  flex: 0.5},
        { field: 'phone', headerName: 'Phone #',  flex: 0.5},
    ];

    useEffect(() => {
        (async () => {
            const result = await GetCompanies()
            setRows(result.data.map(e => {
                return { ...e, id: e._id }
            }))
        })()
    }, [])

    const handleLink = (id) => navigate('/companies/' + id)

    return (
        <div style={{ display: 'flex', height: '100%' }}>
            <div style={{ flexGrow: 1 }}>
                {Access.isAdmin('Company') && <Button variant='outlined' endIcon={<AddIcon />} onClick={() => handleLink('add')}>Add Contact</Button>}
                <Button style={{ float: 'right' }} variant='outlined' onClick={() => navigate('/')} startIcon={<BackIcon />}>Back</Button>
                <DataGrid
                    rows={rows}
                    columns={columns}
                    pageSize={page}
                    rowsPerPageOptions={[5, 10, 15, 20]}
                    onRowClick={(p) => handleLink(p.id)}
                    onPageSizeChange={e => setPage(e)}
                    components={{
                        Toolbar: CustomToolbar,
                    }}
                />
            </div>
        </div>
    );
}

export default function CompanyView() {
    const location = useLocation()

    return <Fragment>
        {location.pathname === '/companies' && <CompanyList />}
        <Routes>
            <Route path='add' element={<AuthProvider><AddCompanyView /></AuthProvider>} />
            <Route path=':id' element={<AuthProvider><EditCompanyView /></AuthProvider>} />
            <Route path=':id/invoices' element={<AuthProvider><CompanyInvoices /></AuthProvider>} />
            <Route path=':id/agreements' element={<AuthProvider><CompanyAgreements /></AuthProvider>} />
            <Route path=':id/balances' element={<AuthProvider><AccountBalance /></AuthProvider>} />
        </Routes>
    </Fragment>
}

function AddCompanyView() {
    const navigate = useNavigate()

    const schema = yup.object({
        name: yup.string().trim().required(),
        description: yup.string().trim().required(),
        address1: yup.string().trim(),
        address2: yup.string(),
        email: yup.string().email().required(),
        city: yup.string().trim(),
        state: yup.string().trim(),
        zip: yup.number().nullable(true).transform((_, val) => (val !== "" ? Number(val) : null)),
        isPaperless: yup.boolean(),
        phone: yup.string().trim().matches(phoneRegExp, 'Phone number is not valid')
    }).required();


    const {register, control, handleSubmit, formState: { errors }, clearErrors, reset, getValues, setError } = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            name: '',
            description: '',
            address1: '',
            address2: '', 
            isPaperless: false,
            city: '',
            state: '',
            email: '',
        }
    });

    const isError = (val) => val !== undefined && val !== null && typeof val === 'object'

    const { isDirty } = useFormState({ control })

    useEffect(() => {
        clearErrors()
        reset()
    }, [clearErrors, reset])

    useEffect(() => {
        reset(getValues())
    }, [isDirty, getValues, reset])

    const onSubmit = data => {
        
            AddCompany(data)
            .then((res)=>{
                if(res.data && res.data._id) navigate('/companies/'+res.data._id)
            })
            .catch((err) => {
                handleErr(err, setError)
            })

            //if (resp) navigate('/companies')
         

    }

    return <Fragment>
        <Controller name="name" control={control} render={({ field }) => <TextField variant='standard' margin='dense' required error={isError(errors.name)} helperText={errors.name && errors.name.message} fullWidth label='Name' {...field} />} />
         <Controller name="description" control={control} render={({ field }) => <TextField variant='standard' margin='dense' required error={isError(errors.description)} helperText={errors.description && errors.description.message} fullWidth label='Description' {...field} />} />
        <Controller name="address1" control={control} render={({ field }) => <TextField variant='standard' margin='dense'  error={isError(errors.address1)} helperText={errors.address1 && errors.address1.message} fullWidth label='Business Address Line 1'  {...field} />} />
        <Controller name="address2" control={control} render={({ field }) => <TextField variant='standard' margin='dense' error={isError(errors.address2)} helperText={errors.address2 && errors.address2.message} fullWidth label='Business Address Line 2 (Contd)'  {...field} />} />
        <Controller name="email" control={control} render={({ field }) => <TextField variant='standard' margin='dense' required error={isError(errors.email)} helperText={errors.email && errors.email.message} fullWidth label='Email'  {...field} />} />
        {   
            /*
            <Controller name="state" control={control} render={({ field }) => <TextField variant='standard' margin='dense'  error={isError(errors.state)} helperText={errors.state && errors.state.message} fullWidth label='State' {...field} />} />
        
            <Controller name="zip" control={control} render={({ field }) => <TextField variant='standard' margin='dense'  error={isError(errors.zip)} helperText={errors.zip && errors.zip.message} fullWidth label='Zip' type='number' {...field} />} />
            <Controller name="city" control={control} render={({ field }) => <TextField variant='standard' margin='dense'  error={isError(errors.city)} helperText={errors.city && errors.city.message} fullWidth label='City' {...field} />} />
            */
        }
        <Controller name="phone" control={control} render={({ field }) => <TextField variant='standard' margin='dense' error={isError(errors.phone)} helperText={errors.phone && errors.phone.message} fullWidth label='Phone' {...field} />} />
       
        <Controller name="isPaperless" control={control} render={({ field }) => <FormControlLabel {...field} control={<Checkbox checked={field.value} />} label="Is Paper less" />} />
        <br />
        <Button startIcon={<SaveIcon />} variant='outlined' onClick={handleSubmit(onSubmit)}>Save</Button>
    </Fragment>
}

function EditCompanyView() {

    const { id } = useParams()
    const [data, setData] = useState({});
    const [refresh, setRefresh] = useState(false);
    

    
    const navigate = useNavigate()
    const schema = yup.object({
        name: yup.string().trim().required(),
        description: yup.string().trim().required(),
        address1: yup.string().trim(),
        address2: yup.string(),
        email: yup.string().email().required(),
        city: yup.string().trim(),
        state: yup.string().trim(),
        zip: yup.number().nullable(true).transform((_, val) => (val !== "" ? Number(val) : null)),
        isPaperless: yup.boolean(),
        status: yup.string(),
        phone: yup.string().trim().matches(phoneRegExp, 'Phone number is not valid')
    }).required();


    const {register, control, handleSubmit, formState: { errors }, clearErrors, reset, getValues, setError } = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            name: '',
            description: '',
            address1: '',
            address2: '',
            email: '',
            city: '',
            state: '',   
            isPaperless: false,
            status: ''
        }
    });

    useEffect(() => {
        (async () => {
            const result = await GetCompanyById(id)
            setData(result.data)
            clearErrors()
            reset(result.data)
        })()
    }, [id, refresh, reset, clearErrors])



    const isError = (val) => val !== undefined && val !== null && typeof val === 'object'

    const { isDirty } = useFormState({ control })

    useEffect(() => {
        reset(getValues())
    }, [isDirty, getValues, reset])

    const onSubmit = data => {
        (async () => {
            const resp = await UpdateCompany(id, data).catch((err) => {
                handleErr(err, setError)
            })
            //if (resp) navigate('/companies')
        })()

    }

    const toggleRefresh = () => setRefresh(r => !r)

    const addDocument = (doc) => AddDocument(id, doc).then(toggleRefresh)
    const addRemark = (doc) => AddRemark(id, doc).then(toggleRefresh)

    const isExt = !Access.isAdmin('Company')

    return <div className='row'>
        <div className='col-8'>
            {!isExt && <Controller name="status" control={control} render={({ field }) => <FormControl error={isError(errors.status)} required variant='standard' margin='dense' fullWidth><InputLabel shrink>Status</InputLabel><NativeSelect {...field} >{getOptions(['Approval Needed', 'Active', 'Inactive'],)}</NativeSelect>{errors.status && <FormHelperText>{errors.status.message}</FormHelperText>}</FormControl>} />}
            <Controller name="name" control={control} render={({ field }) => <TextField variant='standard' disabled={isExt} margin='dense' required error={isError(errors.name)} helperText={errors.name && errors.name.message} fullWidth label='Name' {...field} />} />
            <Controller name="description" control={control} render={({ field }) => <TextField variant='standard' disabled={isExt} margin='dense' required error={isError(errors.description)} helperText={errors.description && errors.description.message} fullWidth label='Description' {...field} />} />
            <Controller name="address1" control={control} render={({ field }) => <TextField variant='standard' margin='dense'   error={isError(errors.address1)} helperText={errors.address1 && errors.address1.message} fullWidth label='Business Address Line 1'  {...field} />} />
            <Controller name="address2" control={control} render={({ field }) => <TextField variant='standard' margin='dense' error={isError(errors.address2)} helperText={errors.address2 && errors.address2.message} fullWidth label='Business Address Line 2 (Contd)'  {...field} />} />
            <Controller name="email" control={control} render={({ field }) => <TextField variant='standard' margin='dense' required error={isError(errors.email)} helperText={errors.email && errors.email.message} fullWidth label='Email'  {...field} />} />

            <Controller name="phone" control={control} render={({ field }) => <TextField variant='standard' InputLabelProps={{ shrink: true }} margin='dense'  error={isError(errors.phone)} helperText={errors.phone && errors.phone.message} fullWidth label='Phone' {...field} />} />

            {
                /*
                    <Controller name="city" control={control} render={({ field }) => <TextField variant='standard' margin='dense'   error={isError(errors.city)} helperText={errors.city && errors.city.message} fullWidth label='City' {...field} />} />
                    <Controller name="state" control={control} render={({ field }) => <TextField variant='standard' margin='dense'   error={isError(errors.state)} helperText={errors.state && errors.state.message} fullWidth label='State' {...field} />} />
                    <Controller name="zip" control={control} render={({ field }) => <TextField variant='standard' InputLabelProps={{ shrink: true }} margin='dense'   error={isError(errors.zip)} helperText={errors.zip && errors.zip.message} fullWidth label='Zip' type='number' {...field} />} />
                    <Controller name="phone" control={control} render={({ field }) => <TextField variant='standard' InputLabelProps={{ shrink: true }} margin='dense'  error={isError(errors.phone)} helperText={errors.phone && errors.phone.message} fullWidth label='Phone' {...field} />} />
                */
            }
            <Controller name="isPaperless" control={control} render={({ field }) => <FormControlLabel {...field} control={<Checkbox checked={field.value} />} label="Is Paperless" />} />
            <br />
            <ButtonGroup>
                <Button startIcon={<SaveIcon />} variant='outlined' onClick={handleSubmit(onSubmit)}>Save</Button>
                <Button startIcon={<ReceiptIcon />} variant='outlined' onClick={() => navigate('invoices')}>Invoices</Button>
                <Button startIcon={<ArticleIcon />} variant='outlined' onClick={() => navigate('agreements')}>Lease Agreements</Button>
                <Button startIcon={<AccountBalanceIcon />} variant='outlined' onClick={() => navigate('balances')}>Account Balance</Button>
                <Users users={data.users} />
            </ButtonGroup>
        </div>
        <div className='col-4'>
            <ButtonGroup>
                <Button style={{ float: 'right' }} variant='outlined' onClick={() => navigate(-1)} startIcon={<BackIcon />}>Back</Button>
                <DocumentView module={'Company'} docIds={data.documents} onUpload={e => addDocument(e._id)} />
                <RemarksView module={'Company'} fullWidth docIds={data.remarks} onUpload={e => addRemark(e._id)} />
            </ButtonGroup>
        </div>
    </div>
}




function CompanyInvoices() {

    const navigate = useNavigate()
    const [rows, setRows] = useState([])
    const { id } = useParams()
    const [page, setPage] = useState(10)

    const amountParser = (params) => getAmount(params.value)

    const dateParser = (params) => dateFormat(params.value)

    const columns = [
        { field: 'tenantId', headerName: 'Company Name', flex: 0.5, hide: true },
        { field: 'name', headerName: 'Invoice Name', flex: 0.5 },
        { field: 'invoiceNumber', headerName: 'Invoice Number', flex: 0.5 },
        { field: 'paymentDate', headerName: 'Payment Date', flex: 0.5, renderCell: dateParser },
        { field: 'dueDate', headerName: 'Due Date', flex: 0.5, renderCell: dateParser },
        { field: 'status', headerName: 'Status', flex: 0.5 },
        { field: 'amountDue', headerName: 'Amount Due', flex: 0.5, renderCell: amountParser },
        { field: 'amountTotal', headerName: 'Amount Total', flex: 0.5, renderCell: amountParser },
        { field: 'amountPaid', headerName: 'Amount Paid', flex: 0.5, renderCell: amountParser },
    ];

    useEffect(() => {
        (async () => {
            const result = await GetCompanyInvoices(id)
            if (Array.isArray(result.data))
                setRows(result.data.map(e => {
                    const { lineItems } = e
                    let amountDue = 0.0
                    let amountPaid = 0.0
                    let amountTotal = 0.0
                    lineItems.forEach(each => {
                        const { charges, amount } = each
                        if (each.receiptId) amountPaid = amountPaid + (charges * amount)
                        amountTotal = amountTotal + (charges * amount)

                    })
                    amountDue = amountTotal - amountPaid
                    return { ...e, id: e._id, amountDue, amountPaid, amountTotal }
                }))


        })()
    }, [id])

    const handleLink = (id) => navigate('/invoices/' + id)

    return (
        <div style={{ display: 'flex', height: '100%' }}>
            <div style={{ flexGrow: 1 }}>
                <DataGrid
                    rows={rows}
                    columns={columns}
                    pageSize={page}
                    rowsPerPageOptions={[5, 10, 15, 20]}
                    onPageSizeChange={e => setPage(e)}
                    onRowClick={(p) => handleLink(p.id)}
                    components={{
                        Toolbar: CustomToolbar,
                    }}
                />
            </div>
        </div>
    );
}


function CompanyAgreements() {

    const navigate = useNavigate()
    const [rows, setRows] = useState([])
    const { id } = useParams()
    const [page, setPage] = useState(10)

    const dateParser = (params) => dateFormat(params.value)

    const columns = [
        { field: 'id', headerName: 'ID', flex: 0.5, hide: true },
        { field: 'title', headerName: 'Agreement Title', flex: 0.5 },
        { field: 'agreementNum', headerName: 'Agreement Number', flex: 0.5 },
        { field: 'startDate', headerName: 'Begin Date', flex: 0.5, renderCell: dateParser, sortComparator: (v1, v2) => dateCompare(v1, v2) },
        { field: 'endDate', headerName: 'End Date', flex: 0.5, renderCell: dateParser, sortComparator: (v1, v2) => dateCompare(v1, v2) },
        { field: 'status', headerName: 'Status', flex: 0.5 },
    ];

    useEffect(() => {
        (async () => {
            const result = await GetCompanyAgreements(id)
            if (Array.isArray(result.data))
                setRows(result.data.map(e => {
                    return { ...e, id: e._id }
                }))
        })()
    }, [id])

    const handleLink = (id) => navigate('/agreements/' + id)

    return (
        <div style={{ display: 'flex', height: '100%' }}>
            <div style={{ flexGrow: 1 }}>
                <Button variant='outlined' endIcon={<AddIcon />} onClick={() => handleLink('add')}>Add Agreement</Button>
                <Button style={{ float: 'right' }} variant='outlined' onClick={() => navigate(-1)} startIcon={<BackIcon />}>Back</Button>
                <DataGrid
                    rows={rows}
                    columns={columns}
                    pageSize={page}
                    rowsPerPageOptions={[5, 10, 15, 20]}
                    onPageSizeChange={e => setPage(e)}
                    onRowClick={(p) => handleLink(p.id)}
                    components={{
                        Toolbar: CustomToolbar,
                    }}
                />
            </div>
        </div>
    );
}

function AccountBalance() {
    const [rows, setRows] = useState([])
    const { id } = useParams()
    const [availAmount, setAvailAmount] = useState(0)
    const [page, setPage] = useState(10)
    const navigate = useNavigate()

    const [refresh, setRefresh] = useState(false)

    const toggleRefresh = () => setRefresh(refresh => !refresh)

    useEffect(() => {
        toggleRefresh()
    }, [])

    const amountParser = (params) => getAmount(params.value)
    const dateParser = (params) => dateFormat(params.value)

    const columns = [
        { field: 'id', headerName: 'ID', flex: 0.5, hide: true },
        { field: 'accountNum', headerName: 'Account Details', flex: 0.5 },
        // { field: 'routingNum', headerName: 'Routing Number', flex: 0.5 },
        { field: 'type', headerName: 'Balance Type', flex: 0.5 },
        { field: 'amount', headerName: 'Amount', flex: 0.5, renderCell: amountParser },
        { field: 'dateApplied', headerName: 'Date Applied', flex: 0.5, renderCell: dateParser, sortComparator: (v1, v2) => dateCompare(v1, v2) },
    ];

    useEffect(() => {
        (async () => {
            const result = await GetCompanyBalances(id)
            let availAmount = 0
            setRows(result.data.map(e => {
                availAmount = availAmount + (e.type === 'Credit' ? e.amount : -(e.amount))
                return { ...e, id: e._id, createdAt: e.startDate }
            }))
            setAvailAmount(availAmount)
        })()
    }, [id, refresh])


    return (
        <div style={{ display: 'flex', height: '100%' }}>
            <div style={{ flexGrow: 1 }}>
                <div className='d-flex'>
                    <Transaction key={new Date().toISOString()} onRefresh={() => toggleRefresh()} />
                    <Balances availAmount={availAmount} onRefresh={() => toggleRefresh()} />
                    <div style={{ marginLeft: 'auto' }}>
                        <ButtonGroup className='float-right' style={{ float: 'right' }} variant="outlined">
                            <Button variant='outlined' onClick={() => navigate(-1)} startIcon={<BackIcon />}>Back</Button>
                            <Button variant="outlined">
                                Balance: ${availAmount}
                            </Button>
                        </ButtonGroup>
                    </div>

                </div>
                <DataGrid
                    rows={rows}
                    columns={columns}
                    pageSize={page}
                    rowsPerPageOptions={[5, 10, 15, 20]}
                    onPageSizeChange={e => setPage(e)}
                    components={{
                        Toolbar: CustomToolbar,
                    }}
                />
            </div>
        </div>
    );
}

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});



function Transaction({ onRefresh }) {
    const [open, setOpen] = React.useState(false);
    const { id } = useParams()

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const schema = yup.object({
        accountNum: yup.string().trim().required(),
        routingNum: yup.string().trim().required(),
        amount: yup.number().required(),
        type: yup.string().trim().required(),
        dateApplied: yup.string().trim().required()

    }).required();

    const {register, control, handleSubmit, formState: { errors }, clearErrors, reset, getValues } = useForm({
        defaultValues: {
            accountType: true,
            accountNum: '',
            routingNum: '',
            amount: '',
            type: '',
            dateApplied: ''
        },
        resolver: yupResolver(schema)
    });

    const { isDirty } = useFormState({ control })


    const checklabels = {
        accountNum: 'Account Number',
        routingNum: 'Routing Number',
    }

    const cashlabels = {
        accountNum: 'Paid By',
        routingNum: 'comments',
    }

    useEffect(() => {
        clearErrors()
    }, [open, clearErrors])

    useEffect(() => {
        reset(getValues())
    }, [isDirty, getValues, reset])

    const onSubmit = async (data) => {
        await AddBalance({ ...data, tenantId: id })
        setOpen(false);
        onRefresh()
    }

    const isError = (val) => val !== undefined && val !== null && typeof val === 'object'

    return (
        Access.isAdmin('Company') && <div>
            <Button variant="outlined" onClick={handleClickOpen} endIcon={<AddIcon />}>
                Add Record
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
                            Add Record
                        </Typography>
                    </Toolbar>
                </AppBar>
                <div className='row'>
                    <div className='col-lg-3 col-md-4 col-sm-6 col-xs-12 mx-auto'>
                        
                            <Controller name="accountType" control={control} render={({ field }) => <FormControlLabel {...field} labelPlacement={getValues('accountType') ? 'start' : 'end'} control={<Switch checked={field.value} />} label={getValues('accountType') ? 'Cash' : 'Check'} />} />
                            <Controller name="accountNum" control={control} render={({ field }) => <TextField margin='dense' variant='standard' error={isError(errors.accountNum)} helperText={errors.accountNum && errors.accountNum.message} type={getValues('accountType') ? "string" : "number"} fullWidth label={getValues('accountType') ? cashlabels.accountNum : checklabels.accountNum}{...field} />} />
                            <Controller name="routingNum" control={control} render={({ field }) => <TextField margin='dense' variant='standard' error={isError(errors.routingNum)} helperText={errors.routingNum && errors.routingNum.message} type={getValues('accountType') ? "string" : "number"} fullWidth label={getValues('accountType') ? cashlabels.routingNum : checklabels.routingNum} {...field} />} />
                            <Controller name="amount" control={control} render={({ field }) => <TextField margin='dense' variant='standard' error={isError(errors.amount)} helperText={errors.amount && errors.amount.message} fullWidth type='number' label='Amount' {...field} />} />
                            <Controller name="type" control={control} render={({ field }) => <FormControl error={isError(errors.type)} variant='standard' margin='dense' fullWidth><InputLabel shrink>Balance Type</InputLabel><NativeSelect {...field} >{getOptions(['Credit', 'Debit'])}</NativeSelect>{errors.type && <FormHelperText>{errors.type.message}</FormHelperText>}</FormControl>} />
                             <Controller name="dateApplied"    control={control}
                            render={({ field }) => 
                            <DateTimeControl label={"Applied Date"} register={register}  errors={errors} field={field} />} />
                            <Button variant='outlined' onClick={handleSubmit(onSubmit)}>SAVE</Button>
                         

                    </div>
                </div>
            </Dialog>
        </div>
    );
}