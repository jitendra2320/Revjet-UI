import React, { useState, useEffect, Fragment } from 'react';
import { useForm, Controller } from "react-hook-form";
import TextField from '@mui/material/TextField';
import NativeSelect from '@mui/material/NativeSelect';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import FormHelperText from '@mui/material/FormHelperText';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import {
    DataGrid, GridToolbarContainer,
    GridToolbarExport,
    gridClasses,
} from '@mui/x-data-grid';
import { yupResolver } from '@hookform/resolvers/yup';
import { PayCard } from './payment'
import * as yup from "yup";
import moment from 'moment';

import {DateTimeControl} from '../../Utils/datetimelocale';
import { Routes, Route, useNavigate, useLocation, useParams } from 'react-router-dom'
import AuthProvider from '../Authentication/authProvider'
import NumberFormat from 'react-number-format';
import { CreateTieDown, GetCompany, GetTieDowns } from '../../REST/invoices'
import Access from '../../Utils/authorize';
import BackIcon from '@mui/icons-material/ArrowBack';
import { GetSystemSettings  } from '../../REST/utilities';


const phoneRegExp = /^(\s*|\d+)$/
const gridDateComparator = (a,b)=>{

    return new Date(a) - new Date(b)
}
function CustomToolbar() {
    return (
        <GridToolbarContainer className={gridClasses.toolbarContainer}>
            <GridToolbarExport />
        </GridToolbarContainer>
    );
}
export default function TieDown() {

    const location = useLocation()


    return <Fragment>
        {location.pathname === '/tiedown' && <TieDownList />}
        <Routes>
            <Route path='create' element={<CreateTieDownView />} />
            <Route path=':id' element={<AuthProvider><ViewTieDown /></AuthProvider>} />
        </Routes>
    </Fragment>
}

function TieDownList() {
    const [rows, setRows] = useState([])
    const [page, setPage] = useState(10)
    const navigate = useNavigate()

    const getDate = (date) => {
        return new Date(date).toLocaleDateString()
    }
 
    const columns = [
        { field: 'firstName', headerName: 'First Name', flex: 0.5 },
        { field: 'lastName', headerName: 'Last Name', flex: 0.5 },
        { field: 'email', headerName: 'Email', flex: 0.5 },
        { field: 'phone', headerName: 'Phone #', flex: 0.5 },
        { field: 'beginDate', headerName: 'Arrival Date',sortComparator:gridDateComparator, flex: 0.5, valueGetter: (p) => getDate(p.row.beginDate) },
        { field: 'endDate', headerName: 'Departure Date (estimated)',sortComparator:gridDateComparator, flex: 0.5, valueGetter: (p) => getDate(p.row.endDate) },
        { field: 'airCraftType', headerName: 'Aircraft Type', flex: 0.5 },
        { field: 'airCraftNum', headerName: 'Aircraft Number', flex: 0.5 },
       /* { field: 'space', headerName: 'Space #', flex: 0.5 },*/
        {
            field: 'amount', headerName: 'Amount', renderCell: (params) => {
                return <NumberFormat value={params.row.amount} displayType={'text'} thousandSeparator={true} prefix={'$'} />
            }
        },
        {
            field: 'invoice', headerName: 'Invoice', width: 100, renderCell: (params) => {
                return <Button onClick={() => navigate('/Invoices/' + params.row.invoice)}>View Invoice</Button>
            }
        }
    ];

    useEffect(() => {
        (async () => {
            const result = await GetTieDowns()
            setRows(result.data.map((e, idx) => {
                return { ...e, id: e._id, }
            }))
        })()
    }, [])


    return (
        <div style={{ display: 'flex', height: 'calc(100% - 50px)' }}>
            <div style={{ flexGrow: 1 }}>
                <Button onClick={() => navigate('/Tiedown/Create')} variant='outlined' endIcon={<AddIcon />}>Add Transient Parking</Button>
                <Button style={{ float: 'right' }} variant='outlined' onClick={() => navigate('/')} startIcon={<BackIcon />}>Back</Button>
                <DataGrid
                    rows={rows}
                    columns={columns}
                    pageSize={page}
                    onPageSizeChange={e => setPage(e)}
                    rowsPerPageOptions={[5, 10, 15, 20]}
                    components={{
                        Toolbar: CustomToolbar,
                    }}
                    initialState={{
                        sorting: {
                          sortModel: [{ field: 'beginDate', sort: 'desc' }],
                        },
                      }}
                />
            </div>
        </div>
    );
}

function ViewTieDown() {
    const { id } = useParams()
    return <p>View {id}</p>
}

function CreateTieDownView() {
    const [data, setData] = useState(null)
    const [tenant, setTenant] = useState(null)
    const [pay, setPay] = useState(true)
    const [done, setDone] = useState(false)
    const navigate = useNavigate()

    useEffect(() => {
        const user = Access.user()
        if (user) {
            (async () => {
                const company = await GetCompany(user)
                setTenant(company.companyId)
            })()
        }
    }, [])
    useEffect(()=>{
        GetSystemSettings().then((result)=>{
            const setting = result.data.find((x)=>{ return x.name == "TIEDOWN_PAYMENT"} )
            if(setting) setPay( setting.value == "true")

        })
    },[])
    const schema = yup.object({
        firstName: yup.string().trim().required(),
        lastName: yup.string().trim().required(),
        beginDate: yup.date().required(),
        endDate: yup.date().required(),
        airCraftType: yup.string().trim().required(),
        airCraftNum: yup.string().trim().required(),
        space: yup.string().trim()/*.required()*/,
        email: yup.string().email().required(),
        phone: yup.string().trim().required().matches(phoneRegExp, 'Phone number is not valid')
    }).required();

    const user = Access.getUser()

    console.log(user)

    const {register, control, handleSubmit, formState: { errors }, clearErrors, reset } = useForm({
        defaultValues: {
            firstName: user ? user.given_name : '',
            lastName: user ? user.family_name : '',
            beginDate: new Date(),
            endDate: '',
            airCraftType: '',
            airCraftNum: '',
            space: '',
            email:'',phone:''
        },
        resolver: yupResolver(schema)
    });

    useEffect(() => {
        clearErrors()
        reset()
    }, [clearErrors, reset])

    const onSubmit = (result) => {
       
        setData(result)
        
    }

    const isError = (val) => val !== undefined && val !== null && typeof val === 'object'

    const getOptions = () => {
        const types = ['Single and Multi-Engine Piston', 'Multi-Engine Turboprop', 'Small Jet', 'Medium Jet 1', 'Medium Jet 2', 'Large Jet']
        return [<option key={'NA'}> Select One</option>].concat(types.map(e => {
            return <option key={e} value={e} > {e}</option>
        }))
    }
    const onSubmitNoPay = (result)=>{
        (async () => {
            const receipt = {}
            const resp = await CreateTieDown(tenant, { receipt, tiedown: { ...result, amount: 0 } })
            console.log(resp.data)
            setDone(true)
        })()  
    }
   if (done)
   {
    navigate('/tiedown', { replace: true }) 
   }

    return <div className='row'>
        <div className='col-3' />
        {data === null && <div className='col-6'>
             
                <Controller name="firstName" control={control} render={({ field }) => 
                <TextField InputLabelProps={{ shrink: true }}   variant='standard' margin='dense' required error={isError(errors.firstName)} helperText={errors.firstName && errors.firstName.message} fullWidth label='First Name' {...field} />} />
                <Controller name="lastName" control={control} render={({ field }) => <TextField  InputLabelProps={{ shrink: true }}    variant='standard' margin='dense' required error={isError(errors.lastName)} helperText={errors.lastName && errors.lastName.message} fullWidth label='Last Name' {...field} />} />
                <Controller name="phone" control={control} render={({ field }) => <TextField  InputLabelProps={{ shrink: true }}    variant='standard' margin='dense' required error={isError(errors.phone)} helperText={errors.phone && errors.phone.message} fullWidth label='Phone' {...field} />} />
                <Controller name="email" control={control} render={({ field }) => <TextField  InputLabelProps={{ shrink: true }}   variant='standard' margin='dense' required error={isError(errors.email)} helperText={errors.email && errors.email.message} fullWidth label='Email'  {...field} />} />
                <Controller name="beginDate"    control={control}
                       render={({ field }) => 
                    <DateTimeControl label={"Arrival Date"} register={register}  errors={errors} field={field} />} />
                <Controller name="endDate"    control={control}
                       render={({ field }) => 
                        <DateTimeControl  label={'Departure Date (estimated)'} register={register}  errors={errors} field={field} />} />
                <Controller name="airCraftType" control={control} render={({ field }) => <FormControl error={isError(errors.airCraftType)} required variant='standard' margin='dense' fullWidth><InputLabel shrink margin='dense'>Aircraft Type</InputLabel><NativeSelect {...field}>{getOptions()}</NativeSelect>{errors.airCraftType && <FormHelperText>{errors.airCraftType.message}</FormHelperText>}</FormControl>} />
                <Controller name="airCraftNum" control={control} render={({ field }) => <TextField  InputLabelProps={{ shrink: true }}   variant='standard' margin='dense' required error={isError(errors.airCraftNum)} helperText={errors.airCraftNum && errors.airCraftNum.message} fullWidth label='Aircraft Number' {...field} />} />
            { /*<Controller name="space" control={control} render={({ field }) => <TextField variant='standard' margin='dense' required error={isError(errors.space)} helperText={errors.space && errors.space.message} fullWidth label='Space #' {...field} />} /> */}
                { pay && <Button fullWidth onClick={handleSubmit(onSubmit)} variant='outlined'>Submit</Button> }
                {!pay && <Button fullWidth onClick={handleSubmit(onSubmitNoPay)} variant='outlined'>Submit</Button>}
            
        </div>
        }
        {data !== null && pay && <div className='col-6'><PayTieDown data={data} company={tenant} /></div>}
        
    </div>
}

function PayTieDown({ data, company }) {

    const [done, setDone] = useState(false)
    const navigate = useNavigate()

    const getAmount = () => {
        const days = Math.abs(moment(data.beginDate).diff(moment(data.endDate), 'days'))
        switch (data.airCraftType.toLowerCase()) {
            case 'Single and Multi-Engine Piston'.toLowerCase():
                return 30 * days
            case 'Multi-Engine Turboprop'.toLowerCase():
                return 80 * days
            case 'Small Jet'.toLowerCase():
                return 30 * days
            case 'Medium Jet 1'.toLowerCase():
                return 30 * days
            case 'Medium Jet 2'.toLowerCase():
                return 50 * days
            case 'Large Jet'.toLowerCase():
                return 80 * days
            default:
                return 0
        }
    }
    
    const handleResult = (receipt) => {
        (async () => {
            const resp = await CreateTieDown(company, { receipt, tiedown: { ...data, amount: getAmount() } })
            console.log(resp.data)
            setDone(true)
        })()

    }

    if (done)
    {
        navigate('/tiedown', { replace: true }) 
    }

    return <React.Fragment>
        <p>The total is calculated based on the aircraft type and the number of nights you will tie-down your aircraft.</p>
        <p>Aircraft type fee:</p>
        <p>Single And Multi-Engine Piston - $30</p>
        <p>Mutli-Engine Turboprop - $80</p>
        <p>Small Jet (upto 16K Lbs) - $30</p>
        <p>Medium Jet 1(16K - 40K Lbs) - $30</p>
        <p>Medium Jet 2(16K - 40K Lbs) - $50</p>
        <p>Large Jet (over 40K Lbs) - $80</p>
        <p>Aircraft Type X Number of Nights = Total.</p>
        <p>To continue to payment, please click submit.</p>

        <h4>Total Amount Due: {<NumberFormat value={getAmount()} displayType={'text'} thousandSeparator={true} prefix={'$'} />}</h4>
        <PayCard onComplete={handleResult} amount={getAmount()} />
    </React.Fragment>

}
