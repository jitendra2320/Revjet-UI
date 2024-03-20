import React, { Fragment, useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from "yup";
import { useForm, Controller } from "react-hook-form";
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import NotesIcon from '@mui/icons-material/NoteAdd';
import { getOptions } from './index'
import {DateTimeControl} from '../../Utils/datetimelocale';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import NativeSelect from '@mui/material/NativeSelect';
 
import FormHelperText from '@mui/material/FormHelperText';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import { GetInsuranceTypes, AddInsurance, GetInsurancesList, DeleteInsurance, GetInsurance, UpdateInsurance } from '../../REST/utilities';
import SupportIcon from '@mui/icons-material/Support';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';
import {
    DataGrid, GridToolbarContainer,
    GridToolbarExport,
    gridClasses,
} from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add'
import { dateFormat } from '../../helpers/dates';
import Access from '../../Utils/authorize';

function CustomToolbar() {
    return (
        <GridToolbarContainer className={gridClasses.toolbarContainer}>
            <GridToolbarExport />
        </GridToolbarContainer>
    );
}

function Insurances({ docIds = [], onUpload, insuranceTypes }) {
    const [data, setData] = useState([])
    const [mode, setMode] = useState(0)
    const [refresh, setRefresh] = useState(false)
    const [page, setPage] = useState(10)
    const [insuranceId, setInsuranceId] = useState(null)

    const toggleRefresh = () => setRefresh(r => !r)

    useEffect(() => {
        (async () => {
            const result = await GetInsurancesList(docIds)
            const opts = await GetInsuranceTypes()
            const insuranceTypes = opts.data
            console.log('result------', docIds, result.data)
            setData(result.data.map(each => { return { ...each, id: each._id, insuranceTypeName: insuranceTypes.find(e => e._id === each.insuranceType).name } }))
            setMode(0)
        })()
    }, [refresh, docIds])

    useEffect(() => toggleRefresh, [])

    const handleMode = setMode

    const handleData = (data) => {
        (async () => {
            const result = await AddInsurance(data)
            console.log(result)
            onUpload(result.data)
            setMode(0)
            toggleRefresh()
        })()
    }

    const dateParser = (params) => dateFormat(params.value)

    const handleDelete = (id) => DeleteInsurance(id).then(toggleRefresh)

    const extColumns = [{ field: 'insuranceTypeName', headerName: 'Insurance Type', flex: 0.5 },
    { field: 'maxCoverageAmount', headerName: 'Coverage Amount', flex: 0.5 },
    { field: 'isApproved', headerName: 'Approved', flex: 0.5 },
    { field: 'startDate', headerName: 'Begin Date', flex: 0.5, renderCell: dateParser },
    { field: 'endDate', headerName: 'End Date', flex: 0.5, renderCell: dateParser }]


    const columns = [
        { field: 'insuranceTypeName', headerName: 'Insurance Type', flex: 0.5 },
        { field: 'maxCoverageAmount', headerName: 'Coverage Amount', flex: 0.5 },
        { field: 'isApproved', headerName: 'Approved', flex: 0.5 },
        { field: 'startDate', headerName: 'Begin Date', flex: 0.5, renderCell: dateParser },
        { field: 'endDate', headerName: 'End Date', flex: 0.5, renderCell: dateParser },
        {
            field: 'actions', headerName: 'Actions', flex: 0.5, renderCell: (params) => {
                return <IconButton onClick={(e) => { e.stopPropagation(); handleDelete(params.id) }}><DeleteIcon /></IconButton>
            }
        }
    ];

    return <div style={{ display: 'flex', height: '100%', width: '100%' }}>
        <div style={{ flexGrow: 1 }}>
            <FormDialog open={mode !== 0} handleClose={() => { handleMode(0); setInsuranceId(null) }} handleSave={handleData} insuranceId={insuranceId} toggleRefresh={toggleRefresh} />
            <Button onClick={() => handleMode(-1)} variant="text" endIcon={<AddIcon />}>
                {'Add Insurance'}
            </Button>
            <DataGrid
                rows={data}
                columns={Access.isAdmin('Lease') ? columns : extColumns}
                pageSize={page}
                rowsPerPageOptions={[5, 10, 15, 20]}
                onPageSizeChange={e => setPage(e)}
                onRowClick={(p) => { setInsuranceId(p.id); setMode(1) }}
                components={{
                    Toolbar: CustomToolbar,
                }}
            />
        </div>
    </div>
}


function FormDialog({ open = false, handleClose, handleSave, insuranceId, toggleRefresh }) {

    const [menu, setMenu] = useState({ insuranceTypes: [] })

    const schema = yup.object({
        insuranceType: yup.string().trim().required(),
        maxCoverageAmount : yup.number().required(),
        startDate : yup.string().required(),
        endDate : yup.string().required() 
    }).required();
    const nextYearDate = ()=>{
        let d = new Date()
        d.setFullYear(d.getFullYear() + 1)
        return d.toISOString()
    }
    const { register,control, handleSubmit, formState: { errors }, clearErrors, reset } = useForm({
        defaultValues: {
            insuranceType: '',
            maxCoverageAmount: 0,
            startDate: new Date().toISOString(),
            endDate: nextYearDate(),
            isApproved: false
        },
        resolver: yupResolver(schema)
    });

    useEffect(() => {
        (async () => {
            let opts = await Promise.all([GetInsuranceTypes()])
            opts = opts.map(e => e.data)
            setMenu(x => { return { ...x, insuranceTypes: opts[0] } })
        })()
        clearErrors()
        reset()
    }, [open, clearErrors, reset])

    useEffect(() => {
        (async () => {
            if (insuranceId) {
                let opts = await GetInsurance(insuranceId)
                reset(opts.data)
            }
            else reset({
                insuranceType: '',
                maxCoverageAmount: 0,
                startDate: '',
                endDate: '',
                isApproved: false
            })
        })()
    }, [insuranceId, reset])

    const onSubmit = (data) => {
        (async () => {
            if (insuranceId) {
                const opts = await UpdateInsurance(insuranceId, data)
                reset(opts.data)
                handleClose()
                toggleRefresh()
            } else handleSave(data)
        })()
    }

    const isError = (val) => val !== undefined && val !== null && typeof val === 'object'

    console.log('insuranceId', insuranceId)

     
    const isAdmin = Access.isAdmin('Lease')

    return <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Insurance</DialogTitle>
        <DialogContent>
            <DialogContentText>&nbsp;</DialogContentText>
            
                <Controller name="insuranceType" control={control} render={({ field }) => <FormControl error={isError(errors.insuranceType)} variant='standard' margin='dense' fullWidth><InputLabel shrink>Insurance Type</InputLabel><NativeSelect {...field} >{getOptions(menu.insuranceTypes)}</NativeSelect>{errors.insuranceType && <FormHelperText>{errors.insuranceType.message}</FormHelperText>}</FormControl>} />
                <Controller name="maxCoverageAmount" control={control} render={({ field }) => <TextField variant='standard' margin='dense' error={isError(errors.maxCoverageAmount)} helperText={errors.maxCoverageAmount && errors.maxCoverageAmount.message} fullWidth label='Max Coverage Amount' {...field} />} type='number' />
                <Controller name="startDate"    control={control} 
                       render={({ field }) => 
                            <DateTimeControl label={"Start Date"} register={register}  errors={errors} field={field} />} />
               <Controller name="endDate"    control={control} 
                       render={({ field }) => 
                            <DateTimeControl label={"End Date"} register={register}  errors={errors} field={field} />} />
                <Controller name="isApproved" control={control} render={({ field }) => <FormControlLabel {...field} disabled={!isAdmin} control={<Checkbox checked={field.value} />} label="Approved" />} />
             
        </DialogContent>
        <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button onClick={handleSubmit(onSubmit)}>Save</Button>
        </DialogActions>
    </Dialog>
}


export default function InsuranceView({ docIds = [], onUpload, icon = false, fullWidth = false }) {
    const [open, setOpen] = React.useState(false);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    return (
        <Fragment>
            {!icon && <Button variant="outlined" startIcon={<SupportIcon />} onClick={handleClickOpen}>
                Insurances
            </Button>}
            {icon && <IconButton onClick={handleClickOpen} edge="end">
                <NotesIcon />
            </IconButton>}
            <Dialog fullScreen open={open} onClose={handleClose}>
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
                            Insurances
                        </Typography>
                    </Toolbar>
                </AppBar>
                <Insurances onUpload={onUpload} docIds={docIds} />
            </Dialog>
        </Fragment>
    );
}

