import React, { Fragment, useState, useEffect } from 'react';
import { GetAvailable, AddProperty, GetCurrent, AddPropDocument, AddPropRemark, AddPropInsurace, RemoveProperty } from "../../REST/agreements";
import { useForm, Controller } from "react-hook-form";
import { getOptions } from './index'
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from "yup";
import ButtonGroup from '@mui/material/ButtonGroup';
import FormControl from '@mui/material/FormControl';
import NativeSelect from '@mui/material/NativeSelect';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import DocumentView from '../Utilities/documents';
import RemarksView from '../Utilities/remarks';
import { useParams } from 'react-router-dom';
import SecurityDeposit from './security';
import Insurance from './insurance';
import AirCraftList from './aircrafts';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import Access from '../../Utils/authorize';
import Confirm from "../../Utils/confirm";

export default function PropertyList({ isEdit, agreementId }) {
    const { id } = useParams()
    const [data, setData] = useState([])
    const [mode, setMode] = useState(0)
    const [refresh, setRefresh] = useState(false)
    const [open, setOpen] = React.useState(false);
    const [removepropertyid,setRemovepropertyid] = React.useState(null);
    const [removepropertyname,setRemovepropertyname] = React.useState(null);
    const toggleRefresh = () => setRefresh(refresh => !refresh)
    
    const handleClose = (value) => {
        setOpen(false);
        setRemovepropertyid(null)
        setRemovepropertyname(null)
    };   
  
    useEffect(() => {
        toggleRefresh()
    }, [])

    useEffect(() => {
        (async () => {
            const result = await GetCurrent(id)
            setData(result.data)
            setMode(0)
        })()
    }, [refresh, id])

    const handleMode = setMode

    const handleData = (data) => {
        (async () => {
            await AddProperty(id, data.name).then(toggleRefresh)
            setMode(0)
        })()
    }
   

    const addDocument = (prop, doc) => AddPropDocument(id, prop, doc).then(toggleRefresh)
    const addRemark = (prop, doc) => AddPropRemark(id, prop, doc).then(toggleRefresh)
    const addInsurance = (prop, doc) => AddPropInsurace(id, prop, doc).then(toggleRefresh)
    const removePropertyConfirm = (id,name) => { 
        setOpen(true)
        setRemovepropertyname(name)
        setRemovepropertyid(id) 
    } 
     
    return <Fragment>
        { open && <Confirm onClose={handleClose} open={open} 
                           title = {"Remove Property "+removepropertyname} 
                           onAccept={()=>{ RemoveProperty(id,removepropertyid).then(toggleRefresh)  } }/> }
        
        <FormDialog open={mode !== 0} data={data} handleClose={() => handleMode(0)} handleSave={handleData} />
        {isEdit && <Button onClick={() => handleMode(1)}>Add Property</Button>}
        <table className='table table-default'>
            <thead>
                <tr>
                    <th>Property Name</th>
                    <th>Rental Amount</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                {data.length === 0 && <tr><td colSpan={3}>No Data</td></tr>}
                {data.map((e, idx) => {
                    const tenantHistory = e.tenants
                    const currTenant = tenantHistory.find(each => each.agreementId === agreementId)
                    return <tr key={idx}>
                        <td>{e.name}</td>
                        <td>${e.rent}</td>
                        <td>
                            <ButtonGroup>
                                {Access.isAdmin('Property') && <Button variant='outlined' startIcon={<HighlightOffIcon />} onClick={() => removePropertyConfirm(e._id,e.name)}>Remove Property</Button>}
                                <Insurance docIds={currTenant.insurances} onUpload={x => addInsurance(e._id, x._id)} />
                                {Access.isAdmin('Property') && <SecurityDeposit propertyId={e._id} data={currTenant.securityDeposit} toggleRefresh={toggleRefresh} />}
                                <DocumentView module={'Property'} docIds={currTenant.documents} onUpload={x => addDocument(e._id, x._id)} />
                                <RemarksView module={'Property'} docIds={currTenant.remarks} onUpload={x => addRemark(e._id, x._id)} />
                                <AirCraftList id={e._id} agreement={agreementId} />
                            </ButtonGroup>
                        </td>
                    </tr>
                })}
            </tbody>
        </table>
    </Fragment>
}



function FormDialog({ open = false, data, handleClose, handleSave }) {

    const [types, setTypes] = useState([])

    const schema = yup.object({
        name: yup.string().trim().required()
    }).required();

    const { control, handleSubmit, formState: { errors }, clearErrors, reset } = useForm({
        defaultValues: {
            name: ''
        },
        resolver: yupResolver(schema)
    });

    useEffect(() => {
        if (open) {
            (async () => {
                const props = await GetAvailable()
                if (Array.isArray(props.data)) {
                    setTypes(props.data)
                }
            })()
            clearErrors()
            reset()
        }
    }, [open, clearErrors, reset])

    const onSubmit = handleSave

    const isError = (val) => val !== undefined && val !== null && typeof val === 'object'


    return <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Add Property</DialogTitle>
        <DialogContent>
            <DialogContentText>&nbsp;</DialogContentText>
            <Controller name="name" control={control} render={({ field }) => <FormControl error={isError(errors.name)} variant='standard'
                margin='dense' fullWidth><InputLabel shrink>Property</InputLabel><NativeSelect {...field} >{getOptions(types)}</NativeSelect>{errors.name &&
                    <FormHelperText>{errors.name.message}</FormHelperText>}</FormControl>} />
        </DialogContent>
        <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button onClick={handleSubmit(onSubmit)}>Save</Button>
        </DialogActions>
    </Dialog>
}