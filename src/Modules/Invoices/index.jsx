import React, { Fragment, useEffect, useState } from 'react'
import Button from '@mui/material/Button'
import {
    DataGrid, GridToolbarContainer,
    GridToolbarExport,
    gridClasses,
} from '@mui/x-data-grid';
import TextField from '@mui/material/TextField';
import { useForm, Controller } from "react-hook-form";
import { Routes, Route, useNavigate, useLocation, useParams } from 'react-router-dom'
import { GetInvoices, GetInvoiceById, UpdateLineItem, RemoveLineItem, PayLineItem, AddRemark, CancelInvoice } from '../../REST/invoices';
import { GetCompanies, GetCompanyById } from '../../REST/company'
import AuthProvider from '../Authentication/authProvider';
import { Checkbox, ButtonGroup } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import BackIcon from '@mui/icons-material/ArrowBack';
import moment from 'moment';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from "yup";
import { PayCard } from '../WaitList/payment';
import RemarksView from '../Utilities/remarks';
import Notices from '../Utilities/notices'
import AddIcon from '@mui/icons-material/Add'
import {DateTimeControl} from '../../Utils/datetimelocale';
import NativeSelect from '@mui/material/NativeSelect';

import FormHelperText from '@mui/material/FormHelperText';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import { AddInvoice, AddLineItem, UpdateComments } from '../../REST/invoices';
import Access from '../../Utils/authorize';
import { getAmount } from '../../helpers/amount';
import { getOptions } from '../../helpers'
import { gridDateFormat } from '../../helpers/dates';


function CustomToolbar() {
    return (
        <GridToolbarContainer className={gridClasses.toolbarContainer}>
            <GridToolbarExport />
        </GridToolbarContainer>
    );
}

function Invoices() {

    const navigate = useNavigate()
    const [rows, setRows] = useState([])
    const [open, setOpen] = useState(false)
    const [page, setPage] = useState(10)

    const amountParser = (params) => getAmount(params.value)
    const dateParser = (params) => gridDateFormat(params.value)

    const columns = [
        { field: 'tenantId', headerName: 'Company Name', flex: 0.5, hide: true },
        { field: 'name', headerName: 'Invoice Name', flex: 0.5 },
        { field: 'invoiceNumber', headerName: 'Invoice Number', flex: 0.5 },
        { field: 'paymntDate', headerName: 'Payment Date', flex: 0.5, renderCell: dateParser },
        { field: 'duesDate', headerName: 'Due Date', flex: 0.5 },
        { field: 'status', headerName: 'Status', flex: 0.5 },
        { field: 'amountDue', headerName: 'Amount Due', flex: 0.5, renderCell: amountParser },
        { field: 'amountTotal', headerName: 'Amount Total', flex: 0.5, renderCell: amountParser },
        { field: 'amountPaid', headerName: 'Amount Paid', flex: 0.5, renderCell: amountParser },
    ];

    useEffect(() => {
        (async () => {
            const result = await GetInvoices()
            if (Array.isArray(result.data))
                setRows(result.data.map(e => {
                    const { lineItems, paymentDate, dueDate } = e
                    let amountDue = 0.0
                    let amountPaid = 0.0
                    let amountTotal = 0.0
                    lineItems.forEach(each => {
                        const { charges } = each
                        if (each.receiptId) amountPaid = amountPaid + each.charges * each.amount
                        amountTotal = amountTotal + charges * each.amount

                    })
                    amountDue = amountTotal - amountPaid
                    return {
                        ...e, id: e._id, amountDue, amountPaid, amountTotal, paymntDate: paymentDate === 'NA' ? 'NA' : moment(paymentDate).format('MM/DD/YYYY'),
                        duesDate: dueDate === 'NA' ? 'NA' : moment(dueDate).format('MM/DD/YYYY')
                    }
                }))
        })()
    }, [])

    const handleLink = (id) => navigate('/invoices/' + id)

    return (
        <div style={{ display: 'flex', height: 'calc(100% - 50px)' }}>
            <div style={{ flexGrow: 1 }}>
                {Access.isInternal() && <Button onClick={() => setOpen(true)} variant='outlined' endIcon={<AddIcon />}>Invoices</Button>}
                <Button style={{ float: 'right' }} variant='outlined' onClick={() => navigate('/')} startIcon={<BackIcon />}>Back</Button>
                <CreateInvoice open={open} handleClose={() => setOpen(false)} />
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

export default function InvoiceView() {
    const location = useLocation()

    return <Fragment>
        {location.pathname === '/invoices' && <Invoices />}
        <Routes>
            {/* <Route path='add' element={<AuthProvider><AddAgreementView /></AuthProvider>} /> */}
            <Route path='/:id' element={<AuthProvider><InvoiceDetail /></AuthProvider>} />
        </Routes>
    </Fragment>
}



function CreateInvoice({ open = false, handleClose }) {

    const [options, setOptions] = useState([])
    const navigate = useNavigate()

    const schema = yup.object({
        name: yup.string().trim().required(),
        description: yup.string().trim().required(),
        dueDate: yup.date().required(),
        tenantId: yup.string().trim().required()
    }).required();

    const { register,control, handleSubmit, formState: { errors }, clearErrors, reset } = useForm({
        defaultValues: {
            name: '',
            description: '',
            dueDate: '',
            tenantId: ''
        },
        resolver: yupResolver(schema)
    });

    useEffect(() => {
        (async () => {
            const resp = await GetCompanies()
            if (Array.isArray(resp.data)) {
                setOptions(resp.data.map(x => {
                    return { label: x.name, value: x._id }
                }))
            }
        })()
    }, [])


    useEffect(() => {
        clearErrors()
        reset()
    }, [open, clearErrors, reset])

    const onSubmit = async (data) => {
        const result = await AddInvoice(data)
        navigate(result.data._id)

    }

    const isError = (val) => val !== undefined && val !== null && typeof val === 'object'

    console.log('options--', options)
    return <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Create Invoice</DialogTitle>
        <DialogContent>
            <DialogContentText>&nbsp;</DialogContentText>
             
                <Controller name="name" control={control} render={({ field }) => <TextField margin='dense' error={isError(errors.name)} required helperText={errors.name && errors.name.message} fullWidth label='Name' {...field} />} />
                <Controller name="description" control={control} render={({ field }) => <TextField margin='dense' error={isError(errors.description)} required helperText={errors.description && errors.description.message} fullWidth label='Description' {...field} />} />
                <Controller name="dueDate"    control={control} 
                       render={({ field }) => 
                            <DateTimeControl label={"Due Date"} register={register}  errors={errors} field={field} />} />
                <Controller name="tenantId" control={control} render={({ field }) =>
                    <FormControl error={isError(errors.tenantId)} variant='standard' margin='dense' fullWidth required>
                        <InputLabel shrink>{'Company'}</InputLabel>
                        <NativeSelect {...field} >{getOptions(options, 'value', 'label')}</NativeSelect>
                        {errors.tenantId && <FormHelperText>{errors.tenantId.message}</FormHelperText>}
                    </FormControl>} />
             
        </DialogContent>
        <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button onClick={handleSubmit(onSubmit)}>Save</Button>
        </DialogActions>
    </Dialog>
}

export function InvoiceDetail({ editor = true }) {
    const navigate = useNavigate()
    const { id } = useParams()

    const [data, setData] = useState({ lineItems: [] })
    const [select, setSelect] = useState([])
    const [edit, setEdit] = useState(null)
    const [refresh, setRefresh] = useState(false)
    const [pay, setPay] = useState(false)
    const [open, setOpen] = useState(false)
    const [openCmts, setOpenCmts] = useState(false)
    const [tenant, setTenant] = useState('')

    useEffect(() => {
        (async () => {
            const resp = await GetInvoiceById(id)
            setData(resp.data)
            if (editor) {
                const tenant = await GetCompanyById(resp.data.tenantId)
                setTenant(tenant.data ? tenant.data.name : ' ')
            }
        })()
    }, [id, refresh, editor])

    const toggleRefresh = () => {
        setRefresh(e => !e)
        setEdit(null)
        setPay(false)
        setSelect([])
    }

    const handleSelected = (checked, id) => {
        if (!checked || select.includes(id))
            setSelect(x => x.filter(e => e !== id))
        else
            setSelect(x => x.concat([id]))
    }

    const getDate = (date) => {
        const result = moment(date)
        if (result.isValid())
            return result.format('MM/DD/YYYY')
        return 'NA'
    }

    const amountDue = (items = []) => items.filter(e => !e.receiptId).reduce((acc, val) => acc + val.charges * val.amount, 0)
    const amountPaid = (items = []) => items.filter(e => e.receiptId).reduce((acc, val) => acc + val.charges * val.amount, 0)
    const totalAmount = (items = []) => items.reduce((acc, val) => acc + val.charges * val.amount, 0)

    const updateLine = (entity) => UpdateLineItem(id, entity).then(toggleRefresh)
    const removeLine = (uid) => {
        RemoveLineItem(id, uid).then((rslt) => {
            if (rslt.data.lineItems.length == 0)
                cancelInvoice()
            else
                toggleRefresh()
        })
    }
    const addRemark = (doc) => AddRemark(id, doc).then(toggleRefresh)
    const cancelInvoice = () => CancelInvoice(id).then(toggleRefresh)

    const handleCmts = (data) => {
        (async () => {
            await UpdateComments(id, data)
            setOpenCmts(false)
            toggleRefresh()
        })()
    }



    if (data)
        return <div className='row'>
            {edit && <LineItemView data={edit} handleClose={() => setEdit(null)} open={!!edit} handleSave={updateLine} />}
            {pay && <PayItems open={pay} handleSave={toggleRefresh} id={id} items={data.lineItems} select={select} handleClose={() => setPay(false)} />}
            {/* {view && <ReceiptView open={view} receiptIds={data.lineItems.map(e => e.receiptId)} handleClose={() => setView(false)} />} */}
            <div className='col-12'>
                <h6 className='text-muted text-center'><small >Invoice Id: {id}</small></h6>
                <ButtonGroup className='float-right' style={{ float: 'right' }} variant="outlined">
                    <Button onClick={() => navigate(-1)} startIcon={<BackIcon />}>Back</Button>
                    {/* {data.lineItems.map(e => e.receiptId).every(e => e) && <Button startIcon={<ReceiptIcon />} onClick={() => setView(true)}>View Receipts</Button>} */}
                    {editor && <RemarksView module={'Invoices'} fullWidth docIds={data.remarks} onUpload={e => addRemark(e._id)} />}
                </ButtonGroup>
                <div className='clearfix' />
            </div>
            <div className='col-12'>
                <h6>Tenant: {tenant}</h6>
                <h6>Invoice Number: {data.invoiceNumber} </h6>
                <h6>Invoice Date: {getDate(data.invoiceDate)} </h6>
                <h6>Payment Date: {getDate(data.paymentDate)} </h6>
                <h6>Due Date: {getDate(data.dueDate)} </h6>
                <h6>Amount Paid: {getAmount(amountPaid(data.lineItems))}</h6>
                <h6>Amount Due: {getAmount(amountDue(data.lineItems))}</h6>
                <h6 className='font-weight-bold text-right'>Status: {data.status}</h6>
                {editor && <Notices tmpltKey='Receipt Notice' title='Get A Copy of Invoice'
                    entity={{
                        invoiceNumber: data.invoiceNumber, invoiceDate: getDate(data.invoiceDate), paymentDate: getDate(data.paymentDate),
                        dueDate: getDate(data.dueDate), amountPaid: amountPaid(data.lineItems), amountDue: amountDue(data.lineItems)
                    }}

                />}

            </div>
            {editor && <div className='col-12 mt-2'>
                {/* <TextField id="standard-basic" label="Comments" variant="standard" multiline rows={2} value={data.comments} /> */}
                <Button variant='outlined' onClick={() => setOpenCmts(true)} endIcon={<AddIcon />}>Comments</Button>
                {openCmts && <AddComments handleClose={() => setOpenCmts(false)} open={openCmts} toggleRefresh={toggleRefresh} cmts={data.comments} handleCmts={handleCmts} />}
            </div>}
            <div className='col-12 p-2' />
            <div className='col-12'>
                {Access.isAdmin('Invoices') && editor && <Button variant='outlined' onClick={() => setOpen(true)} endIcon={<AddIcon />}>Invoice Items</Button>}

                {open && <NewLineItemView handleClose={() => setOpen(false)} open={open} toggleRefresh={toggleRefresh} />}
                {Array.isArray(data.lineItems) && <Fragment>
                    {!Access.isAdmin('Invoices') && editor && <h6><b>Invoice Items</b></h6>}
                    <table className='table table-condensed table-small'>
                        <thead>
                            <tr>
                                <th></th>
                                <th></th>
                                <th>Charge Name </th>
                                <th>Charge Desc. </th>
                                <th className='text-right'>Charge Amount </th>
                                <th className='text-right'>Charge Quantity </th>
                                <th className='text-right'>Charge Total </th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.lineItems.map((e, ix) => {
                                return <tr key={ix}>
                                    <td><Checkbox disabled={!!e.receiptId} className='pb-2' checked={select.includes(e._id)} onChange={(evt) => handleSelected(evt.target.checked, e._id)} /></td>
                                    {Access.isAdmin('Invoices') && editor && <td><Button onClick={() => setEdit(e)} size='small' variant='outlined' startIcon={<EditIcon />}>Edit</Button></td>}
                                    <td><p className='mt-2'>{e.name}</p></td>
                                    <td><p className='mt-2'>{e.description}</p></td>
                                    <td className='text-right'><p className='mt-2'> {getAmount(e.charges)}</p></td>
                                    <td className='text-right'><p className='mt-2'> {e.amount}</p></td>
                                    <td className='text-right'><p className='mt-2'> {getAmount(e.charges * e.amount)}</p></td>
                                    {Access.isAdmin('Invoices') && editor && <td><Button onClick={() => removeLine(e.uid)} size='small' variant='outlined' startIcon={<CloseIcon />}>Remove</Button></td>}
                                </tr>
                            })}
                        </tbody>
                    </table>
                    {data.status === 'Paid' && !editor && <h4 className='lead text-success'>Payment Success.</h4>}
                    {data.status !== 'Paid' && <h5 className='text-right font-weight-bold pr-2'>Total Amount:  {getAmount(totalAmount(data.lineItems))}</h5>}
                    <br />
                    {data.status !== 'Paid' && (
                        <div className="d-flex">
                            <Button variant='outlined' onClick={() => setPay(true)} className='font-weight-bold' disabled={select.length < 1}>Pay Online</Button>
                            {Access.isAdmin('Invoices') && editor && <div style={{ marginLeft: 'auto' }}>
                                <Button variant='outlined' onClick={() => cancelInvoice()} className='ml-auto p-2' disabled={data.status === 'Cancelled'} >Cancel Invoice</Button>
                            </div>}
                        </div>
                    )}


                </Fragment>}
            </div>
        </div>

    return <p> No Invoice Found.</p>
}

function AddComments({ open = false, handleClose, toggleRefresh, cmts = '', handleCmts }) {

    const schema = yup.object({
        comments: yup.string()
    }).required();

    const { register,control, handleSubmit, clearErrors, reset } = useForm({
        defaultValues: {
            comments: cmts
        },
        resolver: yupResolver(schema)
    });

    useEffect(() => {
        clearErrors()
        reset()
    }, [open, clearErrors, reset])

    const onSubmit = (data) => {
        handleCmts(data)
    }

    return <Dialog open={open} onClose={handleClose}>
        <DialogTitle> Add Comments </DialogTitle>
        <DialogContent>
            <DialogContentText>&nbsp;</DialogContentText>
            <Controller name="comments" control={control} render={({ field }) => <TextField variant='standard' margin='dense' multiline rows={5} fullWidth label='comments' {...field} />} />
        </DialogContent>
        <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button onClick={handleSubmit(onSubmit)}>Save</Button>
        </DialogActions>
    </Dialog>
}


function NewLineItemView({ open = false, handleClose, toggleRefresh }) {

    const schema = yup.object({
        name: yup.string().trim().required(),
        description: yup.string().trim().required(),
        charges: yup.number().required(),
        amount: yup.number().required(),
    }).required();

    const { id } = useParams()

    const {register, control, handleSubmit, formState: { errors }, clearErrors, reset } = useForm({
        defaultValues: {
            name: '',
            description: '',
            charges: '',
            amount: ''
        },
        resolver: yupResolver(schema)
    });

    useEffect(() => {
        clearErrors()
        reset()
    }, [open, clearErrors, reset])

    const onSubmit = async (data) => {
        await AddLineItem(id, { ...data })
        handleClose()
        toggleRefresh()
    }

    const isError = (val) => val !== undefined && val !== null && typeof val === 'object'


    return <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Line Item</DialogTitle>
        <DialogContent>
            <DialogContentText>&nbsp;</DialogContentText>
            <Controller name="name" control={control} render={({ field }) => <TextField margin='dense' error={isError(errors.name)} helperText={errors.name && errors.name.message} fullWidth label='Name' {...field} />} />
            <Controller name="description" control={control} render={({ field }) => <TextField margin='dense' error={isError(errors.description)} helperText={errors.description && errors.description.message} fullWidth label='Description' {...field} />} />
            <Controller name="charges" control={control} render={({ field }) => <TextField margin='dense' type="number" error={isError(errors.charges)} helperText={errors.charges && errors.charges.message} fullWidth label='Charges' {...field} />} />
            <Controller name="amount" control={control} render={({ field }) => <TextField margin='dense' type="number" error={isError(errors.amount)} helperText={errors.amount && errors.amount.message} fullWidth label='Quantity' {...field} />} />
        </DialogContent>
        <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button onClick={handleSubmit(onSubmit)}>Save</Button>
        </DialogActions>
    </Dialog>
}

function LineItemView({ open = false, data, handleClose, handleSave }) {

    const schema = yup.object({
        name: yup.string().trim().required(),
        description: yup.string().trim().required(),
        charges: yup.number().required(),
        amount: yup.number().required()
    }).required();

    const {register, control, handleSubmit, formState: { errors }, clearErrors, reset } = useForm({
        defaultValues: {
            ...data
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
        <DialogTitle>Line Item</DialogTitle>
        <DialogContent>
            <DialogContentText>&nbsp;</DialogContentText>
            <Controller name="name" control={control} render={({ field }) => <TextField margin='dense' error={isError(errors.name)} helperText={errors.name && errors.name.message} fullWidth label='Name' {...field} />} />
            <Controller name="description" control={control} render={({ field }) => <TextField margin='dense' error={isError(errors.description)} helperText={errors.description && errors.description.message} fullWidth label='Description' {...field} />} />
            <Controller name="charges" control={control} render={({ field }) => <TextField margin='dense' type="number" error={isError(errors.charges)} helperText={errors.charges && errors.charges.message} fullWidth label='Charges' {...field} />} />
            <Controller name="amount" control={control} render={({ field }) => <TextField margin='dense' type="number" error={isError(errors.amount)} helperText={errors.amount && errors.amount.message} fullWidth label='Quantity' {...field} />} />
        </DialogContent>
        <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button onClick={handleSubmit(onSubmit)}>Save</Button>
        </DialogActions>
    </Dialog>
}

function PayItems({ items = [], select = [], handleClose, open = false, id, handleSave }) {

    const handleComplete = (receipt) => {
        const data = {
            receipt,
            lineItems: items.filter(e => select.includes(e._id))
        }
        PayLineItem(id, data).then(handleSave)
    }

    const totalPay = () => {
        return items.filter(e => select.includes(e._id)).reduce((acc, val) => acc + val.amount * val.charges, 0)
    }

    return <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Pay {getAmount(totalPay())}</DialogTitle>
        <DialogContent>
            <DialogContentText>&nbsp;</DialogContentText>
            <PayCard amount={totalPay()} onComplete={handleComplete} />
        </DialogContent>
    </Dialog>
}



