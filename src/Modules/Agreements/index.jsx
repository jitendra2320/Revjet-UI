import React, { Fragment, useEffect, useState } from 'react'
import Button from '@mui/material/Button';
 

import { GetAgreements, AddAgreement, GetAgreementById, AddDocument, AddRemark, UpdateAgreement, createAgreementInvoice } from '../../REST/agreements'
import { GetActiveCompanies } from '../../REST/company'
import { GetInvoiceCycles, GetPaymentTypes } from '../../REST/utilities'
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
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import NativeSelect from '@mui/material/NativeSelect';
import FormHelperText from '@mui/material/FormHelperText';
import  {DateTimeControl} from '../../Utils/datetimelocale';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import PropertyList from './property';
import Access from '../../Utils/authorize';
import BackIcon from '@mui/icons-material/ArrowBack';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { dateFormat } from '../../helpers/dates';
import AddIcon from '@mui/icons-material/Add';
import { handleErr } from '../../helpers/errors';
import { dateCompare } from '../../helpers/dates';
 

function CustomToolbar() {
    return (
        <GridToolbarContainer className={gridClasses.toolbarContainer}>
            <GridToolbarExport />
        </GridToolbarContainer>
    );
}

function AgreementList() {


    const navigate = useNavigate()
    const [rows, setRows] = useState([])
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
            const result = await GetAgreements()
            if (Array.isArray(result.data))
                setRows(result.data.map(e => {
                    return { ...e, id: e._id }
                }))
        })()
    }, [])

    const handleLink = (id) => navigate('/agreements/' + id)

    return (
        <div style={{ display: 'flex', height: '100%', width: '100%' }}>
            <div style={{ flexGrow: 1 }}>
                {Access.isAdmin('Lease') && <Button variant='outlined' endIcon={<AddIcon />} onClick={() => handleLink('add')}>Add Agreement</Button>}
                <Button style={{ float: 'right' }} variant='outlined' onClick={() => navigate('/')} startIcon={<BackIcon />}>Back</Button>
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

export default function AgreementView() {
    const location = useLocation()

    return <Fragment>
        {location.pathname === '/agreements' && <AgreementList />}
        <Routes>
            <Route path='add' element={<AuthProvider><AddAgreementView /></AuthProvider>} />
            <Route path=':id' element={<AuthProvider><EditAgreementView /></AuthProvider>} />
        </Routes>
    </Fragment>
}

const agrrementSchema = yup.object({
    title: yup.string().trim().required(),
    agreementNum: yup.string().trim().required(),
    description: yup.string().trim().required(),
    startDate: yup.string().trim().required(),
    endDate: yup.string().trim().required(),
    status: yup.string().trim().required(),
    renewable: yup.boolean().required(),
    tenantId: yup.string().trim().required(),
    //leaseTerms: yup.string().trim().required(),
    invoiceCycleId: yup.string().trim().required(),
    rentAdjustmentType: yup.string().trim().required(),
    // adjustmentFreq: yup.number(),
    // adjustmentDate: yup.date()
})
const agrrementSchemaNoEnd = yup.object({
    title: yup.string().trim().required(),
    agreementNum: yup.string().trim().required(),
    description: yup.string().trim().required(),
    startDate: yup.string().trim().required(),
    endDate: yup.string().trim(),
    status: yup.string().trim().required(),
    renewable: yup.boolean().required(),
    tenantId: yup.string().trim().required(),
    //leaseTerms: yup.string().trim().required(),
    invoiceCycleId: yup.string().trim().required(),
    rentAdjustmentType: yup.string().trim().required(),
    // adjustmentFreq: yup.number(),
    // adjustmentDate: yup.date()
})
export const getOptions = (opts = []) => {
    return [<option key='temp'>Select One</option>].concat(opts.map((e, idx) => {
        if (typeof e === 'string')
            return <option key={idx} value={e}>{e}</option>
        return <option key={idx} value={e._id}>{e.name}</option>
    }))
}

function AddAgreementView() {
    const navigate = useNavigate()
    const [menu, setMenu] = useState({ invoice: [], payment: [], status: ['Active', 'Archived', 'Expiring Soon', 'Expired'], tenants: [] })
    const [requireEnddate,setRequireEndate] = useState(false)
    const {register, control, handleSubmit, formState: { errors }, clearErrors, reset, getValues, setError } = useForm({
        resolver: yupResolver(requireEnddate ? agrrementSchema : agrrementSchemaNoEnd),
        defaultValues: {
            title: '',
            agreementNum: '',
            description: '',
            startDate: '',
            endDate: '',
            status: '',
            tenantId: '',
            renewable: false,
            leaseTerms: '',
            invoiceCycleId: '',
            rentAdjustmentType: '',
            adjustmentDate: '',
            adjustmentFreq: ''
        }
    });

    const isError = (val) => val !== undefined && val !== null && typeof val === 'object'

    const { isDirty } = useFormState({ control })

    useEffect(() => {
        reset(getValues())
    }, [isDirty, getValues, reset])

    useEffect(() => {
        (async () => {
            let opts = await Promise.all([GetInvoiceCycles(), GetPaymentTypes(), GetActiveCompanies()])
            opts = opts.map(e => e.data)
            setMenu(x => { return { ...x, invoice: opts[0], payment: opts[1], tenants: opts[2] } })
        })()
        clearErrors()
        reset()
    }, [clearErrors, reset])

    const onSubmit = data => {
        (async () => {
            const resp = await AddAgreement(data).catch((err) => {
                handleErr(err, setError)
            })
            if (resp) navigate('/agreements')
        })()

    }
 
    return <div className='row'>
         
            <div className='col-6'>

            </div>
            <div className='col-6'>
                <ButtonGroup className='float-right' style={{ float: 'right' }} variant="outlined">
                    <Button startIcon={<SaveIcon />} variant='outlined' onClick={handleSubmit(onSubmit)}>Save</Button>
                    <Button variant='outlined' onClick={() => navigate('/agreements')} startIcon={<BackIcon />}>Back</Button>
                </ButtonGroup>
            </div>
            <div className='col-6'>
                <Controller name="title" control={control} render={({ field }) => <TextField variant='standard' margin='dense' required error={isError(errors.title)} helperText={errors.title && errors.title.message} fullWidth label='Agreement Title' {...field} />} />
                <Controller name="agreementNum" control={control} render={({ field }) => <TextField variant='standard' margin='dense' required error={isError(errors.agreementNum)} helperText={errors.agreementNum && errors.agreementNum.message} fullWidth label='Agreement Number' {...field} />} />
                <Controller name=" description" control={control} render={({ field }) => <TextField variant='standard' margin='dense' required error={isError(errors.description)} helperText={errors.description && errors.description.message} fullWidth label='Description'  {...field} />} />
                <Controller name="status" control={control} render={({ field }) => <FormControl error={isError(errors.status)} required variant='standard' margin='dense' fullWidth><InputLabel shrink>Status</InputLabel><NativeSelect {...field} >{getOptions(menu.status)}</NativeSelect>{errors.status && <FormHelperText>{errors.status.message}</FormHelperText>}</FormControl>} />
                <Controller name="startDate"    control={control} 
                       render={({ field }) => 
                            <DateTimeControl label={"Start Date"}  register={register}  errors={errors} field={field} />} />

                {requireEnddate &&
                 <Controller name="endDate"    control={control} 
                 render={({ field }) => 
                      <DateTimeControl label={"End Date"} register={register}  errors={errors} field={field} />} />   
                 }
            </div>
            <div className='col-6'>
                <Controller name="leaseTerms" control={control} render={({ field }) => <TextField multiline variant='standard' margin='dense' error={isError(errors.leaseTerms)} helperText={errors.leaseTerms && errors.leaseTerms.message} fullWidth label='Lease Terms' {...field} />} />
                <Controller name="invoiceCycleId" control={control} render={({ field }) => <FormControl required error={isError(errors.invoiceCycleId)} variant='standard' margin='dense' fullWidth><InputLabel shrink>Invoice Cycle</InputLabel><NativeSelect {...field} >{getOptions(menu.invoice)}</NativeSelect>{errors.invoiceCycleId && <FormHelperText>{errors.invoiceCycleId.message}</FormHelperText>}</FormControl>} />
                <Controller name="rentAdjustmentType" control={control} render={({ field }) => <FormControl required error={isError(errors.rentAdjustmentType)} variant='standard' margin='dense' fullWidth><InputLabel shrink>Rent Adjustment Type</InputLabel><NativeSelect {...field} >{getOptions(menu.payment)}</NativeSelect>{errors.rentAdjustmentType && <FormHelperText>{errors.rentAdjustmentType.message}</FormHelperText>}</FormControl>} />
                <Controller name="adjustmentDate"    control={control} 
                 render={({ field }) => 
                      <DateTimeControl  label={"Adjustment Date"} register={register}  errors={errors} field={field} />} />   
                <Controller name="adjustmentFreq" control={control} render={({ field }) => <TextField variant='standard' type='number' margin='dense' error={isError(errors.adjustmentFreq)} helperText={errors.adjustmentFreq && errors.adjustmentFreq.message} fullWidth label='Adjustment Freq.' {...field} />} />
                <Controller name="tenantId" control={control} render={({ field }) => <FormControl required error={isError(errors.tenantId)} variant='standard' margin='dense' fullWidth><InputLabel shrink>Tenant</InputLabel><NativeSelect {...field} >{getOptions(menu.tenants)}</NativeSelect>{errors.tenantId && <FormHelperText>{errors.tenantId.message}</FormHelperText>}</FormControl>} />
                <Controller name="renewable" control={control} render={({ field }) => <FormControlLabel {...field} control={<Checkbox checked={field.value} onInput={(evt)=>{ setRequireEndate(evt.target.checked )  }} />} label="Is Renewable" />} />
            </div>
         
    </div>
}

function EditAgreementView() {

    const { id } = useParams()
    const [data, setData] = useState({});
    const [refresh, setRefresh] = useState(false);
    const [menu, setMenu] = useState({ invoice: [], payment: [], status: ['Active', 'Archived', 'Expiring Soon', 'Expired'], tenants: [] })
    const [mode, setMode] = useState(0)
    const [requireEnddate,setRequireEndate] = useState(false)
    const navigate = useNavigate()

    const { register,control, handleSubmit, formState: { errors }, clearErrors, reset, getValues, setError } = useForm({
        resolver: yupResolver(requireEnddate ? agrrementSchema : agrrementSchemaNoEnd),
        defaultValues: {
            title: '',
            agreementNum: '',
            description: '',
            startDate: '',
            endDate: '',
            status: '',
            tenantId: '',
            renewable: false,
            leaseTerms: '',
            invoiceCycleId: '',
            rentAdjustmentType: '',
            adjustmentDate: '',
            adjustmentFreq: ''
        }
    });

    const { isDirty } = useFormState({ control })

    useEffect(() => {
        reset(getValues())
    }, [isDirty, getValues, reset])

    useEffect(() => {
        (async () => {
            const result = await GetAgreementById(id)
            setData(result.data)
            setRequireEndate(result.data.renewable)
            clearErrors()
            reset(result.data)
        })()
    }, [id, refresh, reset, clearErrors])

    useEffect(() => {
        (async () => {
            let opts = await Promise.all([GetInvoiceCycles(), GetPaymentTypes(), GetActiveCompanies()])
            opts = opts.map(e => e.data)
            setMenu(x => { return { ...x, invoice: opts[0], payment: opts[1], tenants: opts[2] } })
        })()
        clearErrors()
        reset()
    }, [clearErrors, reset])


    const isError = (val) => val !== undefined && val !== null && typeof val === 'object'



    const onSubmit = data => {
        (async () => {
            const resp = await UpdateAgreement(id, data).catch((err) => {
                handleErr(err, setError)
            })

            //if (resp) navigate('/agreements')
        })()

    }

    const toggleRefresh = () => setRefresh(r => !r)

    const addDocument = (doc) => AddDocument(id, doc).then(toggleRefresh)
    const addRemark = (doc) => AddRemark(id, doc).then(toggleRefresh)

    const handleInvoice = (values) => {
        (async () => {
            const res = await createAgreementInvoice(id, values)
            setMode(0)
            navigate('/invoices/' + res.data._id)
        })()
    }

    const handleMode = setMode

    if (data.status === 'Archived' || !Access.isAdmin('Lease')) {
        return <div className='row'>
           
                <div className='col-6'>

                </div>
                <div className='col-6'>
                    <ButtonGroup>
                        {/* <Button className='float-end' startIcon={<SaveIcon />} variant='outlined' onClick={handleSubmit(onSubmit)}>Save</Button>
                        <Button variant='outlined' startIcon={<AddCircleIcon />} onClick={() => handleMode(1)}>Create Invoice</Button> */}
                        <DocumentView module={'Lease'} docIds={data.documents} onUpload={e => addDocument(e._id)} />
                        <RemarksView module={'Lease'} fullWidth docIds={data.remarks} onUpload={e => addRemark(e._id)} />
                        <Button style={{ float: 'right' }} variant='outlined' onClick={() => navigate(-1)} startIcon={<BackIcon />}>Back</Button>
                    </ButtonGroup>
                </div>
                <div className='col-6'>
                    <Controller name="title" control={control} render={({ field }) => <TextField variant='standard' required disabled margin='dense' error={isError(errors.title)} helperText={errors.title && errors.title.message} fullWidth label='Agreement Title' {...field} />} />
                    <Controller name="agreementNum" control={control} render={({ field }) => <TextField variant='standard' required disabled margin='dense' error={isError(errors.agreementNum)} helperText={errors.agreementNum && errors.agreementNum.message} fullWidth label='Agreement Number' {...field} />} />
                    <Controller name="description" control={control} render={({ field }) => <TextField variant='standard' required disabled margin='dense' error={isError(errors.description)} helperText={errors.description && errors.description.message} fullWidth label='Description'  {...field} />} />
                    <Controller name="status" control={control} render={({ field }) => <FormControl error={isError(errors.status)} required disabled variant='standard' margin='dense' fullWidth><InputLabel shrink>Status</InputLabel><NativeSelect {...field} >{getOptions(menu.status)}</NativeSelect>{errors.status && <FormHelperText>{errors.status.message}</FormHelperText>}</FormControl>} />
                    <Controller name="startDate"    control={control} 
                        render={({ field }) => 
                        <DateTimeControl label={"Start Date"} register={register}  errors={errors} field={field} />} />  
                   { requireEnddate && 
                   <Controller name="endDate"    control={control} 
                   render={({ field }) => 
                        <DateTimeControl label={"End Date"} register={register}  errors={errors} field={field} />} />  
                    }
                </div>
                <div className='col-6'>
                    <Controller name="leaseTerms" control={control} render={({ field }) => <TextField multiline disabled variant='standard' margin='dense' error={isError(errors.leaseTerms)} helperText={errors.leaseTerms && errors.leaseTerms.message} fullWidth label='Lease Terms' {...field} />} />
                    <Controller name="invoiceCycleId" control={control} render={({ field }) => <FormControl error={isError(errors.invoiceCycleId)} required disabled variant='standard' margin='dense' fullWidth><InputLabel shrink>Invoice Cycle</InputLabel><NativeSelect {...field} >{getOptions(menu.invoice)}</NativeSelect>{errors.invoiceCycleId && <FormHelperText>{errors.invoiceCycleId.message}</FormHelperText>}</FormControl>} />
                    <Controller name="rentAdjustmentType" control={control} render={({ field }) => <FormControl error={isError(errors.rentAdjustmentType)} required disabled variant='standard' margin='dense' fullWidth><InputLabel shrink>Rent Adjustment Type</InputLabel><NativeSelect {...field} >{getOptions(menu.payment)}</NativeSelect>{errors.rentAdjustmentType && <FormHelperText>{errors.rentAdjustmentType.message}</FormHelperText>}</FormControl>} />
                    <Controller name="adjustmentDate"    control={control} 
                    render={({ field }) => 
                      <DateTimeControl label={"Adjustment Date"}  register={register}  errors={errors} field={field} />} />  
                    <Controller name="adjustmentFreq" control={control} render={({ field }) => <TextField variant='standard' type='number' disabled margin='dense' error={isError(errors.adjustmentFreq)} helperText={errors.adjustmentFreq && errors.adjustmentFreq.message} fullWidth label='Adjustment Freq.' {...field} />} />
                    <Controller name="tenantId" control={control} render={({ field }) => <FormControl error={isError(errors.tenantId)} required disabled variant='standard' margin='dense' fullWidth><InputLabel shrink>Tenant</InputLabel><NativeSelect {...field} >{getOptions(menu.tenants)}</NativeSelect>{errors.tenantId && <FormHelperText>{errors.tenantId.message}</FormHelperText>}</FormControl>} />
                    <Controller name="renewable" control={control} render={({ field }) => <FormControlLabel {...field} disabled control={<Checkbox onInput={(evt)=>{ setRequireEndate(evt.target.checked )  }}  checked={field.value} />} label="Renewable"  />} />
                </div>
                <div className='col-12'>
                    <PropertyList isEdit={false} agreementId={id} />
                </div>
                <div className='col-12'>
                    <FormDialog open={mode !== 0} handleClose={() => handleMode(0)} handleSave={handleInvoice} />
                </div>
             
        </div >
    }

    return <div className='row'>
        
            <div className='col-6'>

            </div>
            <div className='col-6'>
                <ButtonGroup>
                    <Button className='float-end' startIcon={<SaveIcon />} variant='outlined' onClick={handleSubmit(onSubmit)}>Save</Button>
                    <Button variant='outlined' startIcon={<AddCircleIcon />} onClick={() => handleMode(1)}>Create Invoice</Button>
                    <DocumentView module={'Lease'} docIds={data.documents} onUpload={e => addDocument(e._id)} />
                    <RemarksView module={'Lease'} fullWidth docIds={data.remarks} onUpload={e => addRemark(e._id)} />
                    <Button style={{ float: 'right' }} variant='outlined' onClick={() => navigate(-1)} startIcon={<BackIcon />}>Back</Button>
                </ButtonGroup>
            </div>
            <div className='col-6'>
                <Controller name="title" control={control} render={({ field }) => <TextField variant='standard' required margin='dense' error={isError(errors.title)} helperText={errors.title && errors.title.message} fullWidth label='Agreement Title' {...field} />} />
                <Controller name="agreementNum" control={control} render={({ field }) => <TextField variant='standard' required margin='dense' error={isError(errors.agreementNum)} helperText={errors.agreementNum && errors.agreementNum.message} fullWidth label='Agreement Number' {...field} />} />
                <Controller name="description" control={control} render={({ field }) => <TextField variant='standard' required margin='dense' error={isError(errors.description)} helperText={errors.description && errors.description.message} fullWidth label='Description'  {...field} />} />
                <Controller name="status" control={control} render={({ field }) => <FormControl error={isError(errors.status)} required variant='standard' margin='dense' fullWidth><InputLabel shrink>Status</InputLabel><NativeSelect {...field} >{getOptions(menu.status)}</NativeSelect>{errors.status && <FormHelperText>{errors.status.message}</FormHelperText>}</FormControl>} />
                <Controller name="startDate"    control={control} 
                 render={({ field }) => 
                      <DateTimeControl  label={"Start Date"} register={register}  errors={errors} field={field} />} />  
                { requireEnddate && 
                <Controller name="endDate"    control={control} 
                render={({ field }) => 
                     <DateTimeControl  label={"End Date"} register={register}  errors={errors} field={field} />} />  
                }
            </div>
            <div className='col-6'>
                <Controller name="leaseTerms" control={control} render={({ field }) => <TextField multiline variant='standard' margin='dense' error={isError(errors.leaseTerms)} helperText={errors.leaseTerms && errors.leaseTerms.message} fullWidth label='Lease Terms' {...field} />} />
                <Controller name="invoiceCycleId" control={control} render={({ field }) => <FormControl error={isError(errors.invoiceCycleId)} required variant='standard' margin='dense' fullWidth><InputLabel shrink>Invoice Cycle</InputLabel><NativeSelect {...field} >{getOptions(menu.invoice)}</NativeSelect>{errors.invoiceCycleId && <FormHelperText>{errors.invoiceCycleId.message}</FormHelperText>}</FormControl>} />
                <Controller name="rentAdjustmentType" control={control} render={({ field }) => <FormControl error={isError(errors.rentAdjustmentType)} required variant='standard' margin='dense' fullWidth><InputLabel shrink>Rent Adjustment Type</InputLabel><NativeSelect {...field} >{getOptions(menu.payment)}</NativeSelect>{errors.rentAdjustmentType && <FormHelperText>{errors.rentAdjustmentType.message}</FormHelperText>}</FormControl>} />
                <Controller name="adjustmentDate"    control={control} 
                 render={({ field }) => 
                      <DateTimeControl  label={"Adjustment Date"} register={register}  errors={errors} field={field} />} />  
                <Controller name="adjustmentFreq" control={control} render={({ field }) => <TextField variant='standard' type='number' margin='dense' error={isError(errors.adjustmentFreq)} helperText={errors.adjustmentFreq && errors.adjustmentFreq.message} fullWidth label='Adjustment Freq.' {...field} />} />
                <Controller name="tenantId" control={control} render={({ field }) => <FormControl error={isError(errors.tenantId)} required variant='standard' margin='dense' fullWidth><InputLabel shrink>Tenant</InputLabel><NativeSelect {...field} >{getOptions(menu.tenants)}</NativeSelect>{errors.tenantId && <FormHelperText>{errors.tenantId.message}</FormHelperText>}</FormControl>} />
                <Controller name="renewable" control={control} render={({ field }) => <FormControlLabel {...field} control={<Checkbox onInput={(evt)=>{ setRequireEndate(evt.target.checked )  }} checked={field.value} />} label="Renewable" />} />
            </div>
            <div className='col-12'>
                <PropertyList isEdit={true} agreementId={id} />
            </div>
            <div className='col-12'>
                <FormDialog open={mode !== 0} handleClose={() => handleMode(0)} handleSave={handleInvoice} />
            </div>
         
    </div >

}

function FormDialog({ open = false, data, handleClose, handleSave }) {
    const schema = yup.object({
        startDate: yup.string().trim().required(),
        endDate: yup.string().trim().required(),
    }).required();

    const { register,control, handleSubmit, formState: { errors }, clearErrors, reset } = useForm({
        defaultValues: {
            startDate: '',
            endDate: ''
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
        <DialogTitle> Invoice </DialogTitle>
        <DialogContent>
            <DialogContentText>&nbsp;</DialogContentText>
            <Controller name="startDate"    control={control} 
                 render={({ field }) => 
                      <DateTimeControl  label={"Start Date"} register={register}  errors={errors} field={field} />} />   
            <Controller name="endDate" label={"End Date"}    control={control} 
                 render={({ field }) => 
                      <DateTimeControl register={register}  errors={errors} field={field} />} />  
             
        </DialogContent>
        <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button onClick={handleSubmit(onSubmit)}>Save</Button>
        </DialogActions>
    </Dialog>
}