import React, { Fragment, useEffect, useState } from 'react'
import Button from '@mui/material/Button'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm, Controller } from "react-hook-form";
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import NativeSelect from '@mui/material/NativeSelect';
import FormHelperText from '@mui/material/FormHelperText';
import { yupResolver } from '@hookform/resolvers/yup';
import { GetAreas, GetPropertyTypes, AddProperty, GetList, AddImages, RemoveImages, HeaderImage, GetProperty, AddDocument, AddRemark, UpdatePropertyStatus } from '../../REST/properties'
import * as yup from "yup";
import {
    DataGrid, GridToolbarContainer,
    GridToolbarExport,
    gridClasses,
} from '@mui/x-data-grid';
import PropertyEditView from './edit';
import Documents from '../Utilities/documents';
import Remarks from '../Utilities/remarks';
import ButtonGroup from '@mui/material/ButtonGroup';
import Divider from '@mui/material/Divider';
import { GetAgreementById } from '../../REST/agreements';
//import { GetCompanyById } from '../../REST/company';
import Typography from '@mui/material/Typography';
import LeaseHistory from '../Agreements/leaseHistory';
import BackIcon from '@mui/icons-material/ArrowBack';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import SaveIcon from '@mui/icons-material/Save';
import ArticleIcon from '@mui/icons-material/Article';
import { handleErr } from '../../helpers/errors';
import DefaultSettings from '../../Utils/settings';

function CustomToolbar() {
    return (
        <GridToolbarContainer className={gridClasses.toolbarContainer}>
            <GridToolbarExport />
        </GridToolbarContainer>
    );
}

export default function DataGridDemo() {

    const navigate = useNavigate()
    const [rows, setRows] = useState([])
    const [opts, setOpts] = useState({ area: [], propertyType: [] })
    const [page, setPage] = useState(10)

    const getValue = (type) => (params) => {
        return (opts[type].find(e => e._id === params.row[type]) || { name: 'NA' }).name
    }

    const columns = [
        { field: 'id', headerName: 'ID', flex: 0.5, hide: true },
        { field: 'name', headerName: 'Name', flex: 0.5 },
        { field: 'description', headerName: 'Description', flex: 0.5 },
        { field: 'address', headerName: 'Address', flex: 0.5 },
        { field: 'propertyType', headerName: 'Property Type', flex: 0.5, valueGetter: getValue('propertyType') },
        { field: 'area', headerName: 'Property Area', flex: 0.5, valueGetter: getValue('area') },
        { field: 'status', headerName: 'Status', flex: 0.5 }
    ];

    useEffect(() => {
        (async () => {
            const result = await GetList()
            const areas = await GetAreas()
            const types = await GetPropertyTypes()
            setRows(result.data.map(e => {
                return { ...e, id: e._id }
            }))
            setOpts({ area: areas.data, propertyType: types.data })
        })()
    }, [])

    const handleLink = (id) => navigate('/properties/listings/' + id)

    return (
        <div style={{ display: 'flex', height: '100%' }}>
            <div style={{ flexGrow: 1 }}>
                <Button startIcon={<AddCircleIcon />} variant='outlined' onClick={() => handleLink('add')}>Add Property</Button>
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

export function AddListing() {
    const [area, setArea] = useState([])
    const [type, setType] = useState([])
    const navigate = useNavigate()

    const schema = yup.object({
        name: yup.string().trim().required(),
        description: yup.string().trim().required(),
        area: yup.string().trim().required(),
        rent: yup.number().required(),
        propertyType: yup.string().trim().required(),
        address: yup.string().trim().required()
    })

    const { control, handleSubmit, setError, formState: { errors }, clearErrors, reset } = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            name: '',
            description: '',
            rent: '',
            address: '',
            area: '',
            propertyType: ''
        }
    });

    console.log('errors', errors)
    const isError = (val) => val !== undefined && val !== null && typeof val === 'object'

    useEffect(() => {
        (async () => {
            const areas = await GetAreas()
            const types = await GetPropertyTypes()
            setArea(x => areas.data)
            setType(y => types.data)
        })()

        clearErrors()
        reset()
    }, [clearErrors, reset])

    const onSubmit = data => {
        (async () => {
            console.log(data)
            const result = { ...data, location: { type: 'Point', coordinates: [33.6346, -116.1658] } }
            const resp = await AddProperty(result).catch((err) => {
                handleErr(err, setError)
            })
            if (resp) navigate('/properties/listings')
        })()
    }

    const getOptions = (opts = []) => {
        return [<option key='select'>Select One</option>].concat(opts.map((e, idx) => {
            return <option key={idx} value={e._id}>{e.name}</option>
        }))
    }

    return <Fragment>
        <Controller name="name" control={control} render={({ field }) => <TextField variant='standard' margin='dense' required error={isError(errors.name)} helperText={errors.name && errors.name.message} fullWidth label='Name' {...field} />} />
        <Controller name="description" control={control} render={({ field }) => <TextField variant='standard' margin='dense' required error={isError(errors.description)} helperText={errors.description && errors.description.message} fullWidth label='Description' {...field} />} />
        <Controller name="area" control={control} render={({ field }) => <FormControl error={isError(errors.area)} variant='standard' margin='dense' required fullWidth><InputLabel shrink >Area</InputLabel><NativeSelect {...field} >{getOptions(area)}</NativeSelect>{errors.area && <FormHelperText>{errors.area.message}</FormHelperText>}</FormControl>} />
        <Controller name="rent" control={control} render={({ field }) => <TextField variant='standard' margin='dense' required error={isError(errors.rent)} helperText={errors.rent && errors.rent.message} fullWidth label='Rental Amount' type='number' {...field} />} />
        <Controller name="propertyType" control={control} render={({ field }) => <FormControl error={isError(errors.propertyType)} variant='standard' margin='dense' required fullWidth><InputLabel shrink >Property Type</InputLabel><NativeSelect {...field}>{getOptions(type)}</NativeSelect>{errors.propertyType && <FormHelperText>{errors.propertyType.message}</FormHelperText>}</FormControl>} />
        <Controller name="address" control={control} render={({ field }) => <TextField variant='standard' margin='dense' required error={isError(errors.address)} helperText={errors.address && errors.address.message} fullWidth label='Address' {...field} />} />
        <Button variant='outlined' startIcon={<SaveIcon />} onClick={handleSubmit(onSubmit)}>Save</Button>
    </Fragment>
}

export function UpdateListing() {
    const { id } = useParams()
    const [data, setData] = useState({ images: [], documents: [] })
    const [refresh, setRefresh] = useState(false)
    // const [tenant, setTenant] = useState({})
    const [agreement, setAgreement] = useState({})
    const navigate = useNavigate()

    const toggleRefresh = () => setRefresh(r => !r)

    useEffect(() => {
        toggleRefresh()
    }, [])

    useEffect(() => {
        (async () => {
            const result = await GetProperty(id)
            const { data } = result
            const { tenants, status } = data
            if (status === "Leased") {
                const currentTenant = tenants[tenants.length - 1]
                const { agreementId } = currentTenant
                const res = await GetAgreementById(agreementId)
                //const resp = await GetCompanyById(tenantId)
                setAgreement(res.data)
                //setTenant(resp.data)
            }
            setData(data)
        })()
    }, [refresh, id])

    const addDocument = (doc) => AddDocument(id, doc).then(toggleRefresh)
    const addRemark = (doc) => AddRemark(id, doc).then(toggleRefresh)
    const handleStatus = (status) => { UpdatePropertyStatus(id, { status }).then(toggleRefresh) }

    return <div className='row'>
        <div>
            <Button style={{ float: 'right' }} variant='outlined' onClick={() => navigate(-1)} startIcon={<BackIcon />}>Back</Button>
        </div>
        <div className='col-6'>
            <PropertyEditView listing={data} onRefresh={toggleRefresh} />
        </div>
        <div className='col-6'>
            <HeaderImageView listing={data} onRefresh={toggleRefresh} />
            <OtherImageView listing={data} onRefresh={toggleRefresh} />
            <ButtonGroup variant="contained" aria-label="outlined primary button group">
                <Documents docIds={data.documents} onUpload={res => addDocument(res._id)} module="Property" />
                <Remarks docIds={data.remarks} onUpload={res => addRemark(res._id)} fullWidth={true} module="Property" />
            </ButtonGroup>
            <div className='mt-5'>
                <h3 className="font-weight-bold text-center clearfix">
                    {'Lease Info'}
                </h3>
                <Divider />
                {data.status === 'Leased' ? (
                    <Fragment>
                        <Typography variant="body1" gutterBottom component="div">
                            Agreement Title: {agreement.title}
                        </Typography>
                        <Typography vvariant="body1" gutterBottom component="div">
                            Agreement Number: {agreement.agreementNum}
                        </Typography>
                        {/* <Typography variant="body1" gutterBottom component="div">
                            Company: {tenant.name}
                        </Typography> */}
                    </Fragment>
                ) : <Typography variant="body1" gutterBottom component="div">
                    Status: {data.status}
                </Typography>}

                <ButtonGroup variant="contained" aria-label="outlined primary button group">
                    {data.status === 'Leased' && <Button variant='outlined' startIcon={<ArticleIcon />} onClick={() => navigate('/agreements/' + agreement._id)}>Lease Agreement</Button>}
                    {/* <Button variant='outlined' onClick={() => navigate('/listings/' + id + '/history')}>History</Button> */}
                    <LeaseHistory />
                    {data.status === 'Inactive' && < Button variant='outlined' onClick={() => handleStatus('Active')}>Make Active</Button>}
                    {data.status === 'Active' && <Button variant='outlined' onClick={() => handleStatus('Inactive')}>Make Inactive</Button>}
                </ButtonGroup>

            </div>
        </div>
    </div >
}

function HeaderImageView({ listing, onRefresh }) {

    const { id } = useParams()

    const handleUpload = (data) => {
        (async () => {
            await HeaderImage(id, data)
            onRefresh()
        })()
    }

    return <Fragment>
        <h4 className='text-center'>Header Image</h4>
        {listing.headerImage && <div className='text-center'>
            <img alt='' className='rounded img-thumbnail' src={process.env.REACT_APP_API_URL + '/api/Property/List/Images/' + listing.headerImage} width={100} height={'auto'} />
        </div>}
        <ImageUpload onUpload={handleUpload} />
    </Fragment>
}

function OtherImageView({ listing, onRefresh }) {
    const { id } = useParams()

    const handleUpload = (data) => {
        (async () => {
            await AddImages(id, data)
            onRefresh()
        })()
    }

    const handleDelete = (doc) => {
        (async () => {
            await RemoveImages(id, doc)
            onRefresh()
        })()
    }

    return <div className='row'>
        <div className='col-12'>
            <h4 className='text-center'>Display Images</h4>
        </div>
        {listing.images.map(e => {
            return <div key={e} className='col-2'>
                <div className='row'>
                    <div className='col-12'>
                        <div className='text-center'>
                            <img alt='Images' className='rounded' key={e} src={process.env.REACT_APP_API_URL + '/api/Property/List/Images/' + e} width={'auto'} height={50} />
                        </div>
                    </div>
                    <div className='col-12'>
                        <Button fullWidth onClick={() => handleDelete(e)}>Delete</Button>
                    </div>
                </div>
            </div>
        })}
        <div className='col-12'></div>
        <div className='col-12'>
            <ImageUpload onUpload={handleUpload} />
        </div>
    </div>
}

function ImageUpload({ onUpload }) {
    const handleUpload = (evt) => {
        const files = evt.target.files
        if (files && files.length > 0) {
            const file = files[0]
            if (evt.target.files[0].size < 1000000) {
                const formData = new FormData()
                formData.append('file', file)
                onUpload(formData)
                evt.target.value = ''
            }
            else {
                if (DefaultSettings.getAlert() != null)
                    DefaultSettings.getAlert().show('File Size cannot be more than 1MB', 'error');
            }
        }
    }

    return <input onChange={handleUpload} className='form-control' type='file' accept='image/*' />
}