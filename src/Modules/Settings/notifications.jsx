import React, { Fragment, useState, useEffect, useRef, forwardRef } from 'react';
import {  GetNotifcationFields } from "../../REST/utilities";
import { GetList, GetById, AddItem, UpdateItem, DeleteItem } from '../../REST/crud'

import { useForm, Controller, useFormState } from "react-hook-form";
import TextField from '@mui/material/TextField';
import NativeSelect from '@mui/material/NativeSelect';
import AddIcon from '@mui/icons-material/Add'
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import FormHelperText from '@mui/material/FormHelperText';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Toolbar from '@mui/material/Toolbar';
import Slide from '@mui/material/Slide';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';
import AppBar from '@mui/material/AppBar';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from "yup";
import TemplateEditor from "../../Utils/templates";
 
import BackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import {
    DataGrid, GridToolbarContainer,
    GridToolbarExport,
    gridClasses,
} from '@mui/x-data-grid';
function CustomToolbar() {
    return (
        <GridToolbarContainer className={gridClasses.toolbarContainer}>

        </GridToolbarContainer>
    );
}
export default function Notifications() {
     
    const [viewstate,setViewstate] = useState({data:[],fields:[]  })
    const {data,fields} = viewstate
    const [mode,setMode] = useState(null)
    const navigate = useNavigate()

    //const toggleRefresh = () => setRefresh(refresh => !refresh)
    /*
    useEffect(() => {
        toggleRefresh()
    }, [])
   */
    const reloadData = ()=>{
        const allPromise = Promise.all([GetList('Notifications'), GetNotifcationFields()]);
        allPromise.then(values => {
            
            setViewstate({  fields:values[1]?.data,data:values[0]?.data})
            setMode(null)
       }).catch(error => {
           console.log(error); 
           navigate("/settings")
       });
    }
    useEffect(() => {
        reloadData()
          
        
    }, [])
    
    const handleMode = (mode)=>{  setMode(mode)  }

    const handleData = (data) => {
        if(!data._id)
        {
            AddItem('Notifications',data).then(reloadData)
        }
        else 
        {
            UpdateItem('Notifications',data._id,data).then(reloadData)
        }
    }

    const handleDelete = (id) => {
        
        DeleteItem('Notifications',id).then(reloadData)
         
    }
    const getColumns = ()=>{
        const actions = {
            field: 'actions', headerName: 'Actions', flex: 0.5, renderCell: (params) => {
                return <IconButton onClick={(e) => { e.stopPropagation(); handleDelete(params.row._id) }}><DeleteIcon /></IconButton>
            }
        }
        let cols =  [
            { 
                field: 'name', headerName: 'Event Name', flex: 0.5 ,  id: 'notification_1' 
            },
            {
                field: 'module', headerName: 'Module', flex: 0.5,  id: 'notification_2' 
            },
            {
                field: 'trigger', headerName: 'Event Trigger', flex: 0.5 ,  id: 'notification_3' 
            } 
        ]
        cols.push(actions)
        return cols;
    } 
     
   return  ( 
    <div style={{ display: 'flex', height: 'calc(100% - 50px)' }}>
        <div style={{ flexGrow: 1 }}>
        <Button variant='outlined' onClick={()=>{ handleMode({})}} endIcon={<AddIcon />}>
                    {"Events"}
        </Button> 
        <Button style={{ float: 'right' }} variant='outlined' onClick={() => navigate(-1)} startIcon={<BackIcon />}>Back</Button>
         
        {mode !== null && <FormDialog open={mode !== null} data={mode} handleClose={() => handleMode(null)} fields={fields} handleSave={handleData} />  }
          
        <DataGrid
            rows={data}
            columns={getColumns()}
            pageSize={10}
            rowsPerPageOptions={[5, 10, 15, 20]}
            disableRowSelectionOnClick 
            onRowClick={(params) => handleMode(params.row)}
            components={{
                Toolbar: CustomToolbar,
            }}
            getRowId={(i) => {
                
                return i?._id
            }}
        />
        
       </div> 
    </div>
    )
}



function FormDialog({ open = false, data, handleClose, handleSave, fields = [] }) {
    const schema = yup.object({
        name: yup.string().trim().required(),
        module: yup.string().trim().required(),
        trigger: yup.string().trim().required(),
        template: yup.string().trim().required(),
        notify: yup.string().trim().required(),
        changefield : yup.string(),
        changevaluefrom : yup.string(),
        changevalueto : yup.string()
    }).required();

    const { control, handleSubmit, formState: { errors }, clearErrors, reset, getValues,watch } = useForm({
        defaultValues: {
            name: '',
            module: '',
            trigger: '',
            template: '',
            notify: '',
            changefield:"",
            changevaluefrom:"",
            changevalueto:""
        },
        resolver: yupResolver(schema)
    });

    const { isDirty } = useFormState({ control })
    const trigger = watch("trigger")
    const module = watch("module")
    const changefield= watch("changefield")
    const changevaluefrom = watch("changevaluefrom")
    const changevalueto = watch("changevalueto")
    const moduleFields = {
        "Invoices":[
            {name:"status",values:["Created","Paid" ]},
            {name:"LineItems"},          
            { name:  'name' },
            { name:  'description' },
            { name:  'comments' },
            { name:  'invoiceNumber' },
            { name:  'invoiceDate' },
            { name:  'dueDate' },
            { name:  'paymentDate' },
            
        ],
        "Waitlist":[
            { name:"status",values:["InProgress","Paid" ]},
            { name:  'firstName' },
            { name:  'lastName' },
            { name:  'phone' },
            { name:  'email' },
            { name:  'organization' },
            { name:  'queue' },
        ],
        "Company" :[
            { name:"status",values:["Approval Needed","Active","Inactive" ]},
            { name: 'name' },
            { name:  'description' },
            { name:  'address1' },
            { name:  'address2' },
            { name:  'city' },
            { name:  'state' },
            { name:  'zip' }
        ],
        "Accounts" : [
            { name: 'Email' }
        ],
        "Messages" : [
            { name:  'email' }
        ],
        "Insurance" : [
                        { name:"status",values:["Active","Expiring Soon","Expired" ]},
                        { name: 'maxCoverageAmount' },
                        { name: 'isApproved' },
                        { name:'startDate' },
                        { name:  'endDate' },
                    ],        
         
        "Agreements" : [
                        {"name":"status",values:['Active', 'Archived', 'Expiring Soon', 'Expired' ]},
                        { name: 'title' },
                        { name: 'agreementNum' },
                        { name: 'description' },
                        { name: 'startDate' },
                        { name: 'endDate' },                    
                        { name: 'renewable' },
                        { name: 'adjustmentDate' },
                        { name: 'adjustmentFreq' },
                        { name:"leaseTerms"}
                    ]
    }
    
    useEffect(() => {
        clearErrors()
        reset(data)
    }, [open, clearErrors, reset])

    const onSubmit = handleSave

    const isError = (val) => val !== undefined && val !== null && typeof val === 'object'

    const getOptions = (type) => {
        if (type === 'Modules') {
            return (
                <Fragment>
                <option></option>
                {
                    Object.keys(moduleFields).map((e,idx) => <option key={idx} >{e}</option>)
                }
                </Fragment>
            )  
        }
        else if (type === 'Trigger') {
            return <Fragment>
                <option></option>
                <option>Created</option>
                <option>Updated</option>
                <option>Removed</option>
            </Fragment>
        }
        else if (type === 'Notify') {
            return <Fragment>
                <option></option>
                <option>Internal</option>
                <option>External</option>
                <option>Both</option>
            </Fragment>
        }
        return <option>NA</option>
    }

    useEffect(() => {
        reset(getValues())
    }, [isDirty, getValues, reset])
    
    return (
    <Dialog fullScreen open={open} onClose={handleClose}  >
        <AppBar sx={{ position: 'relative' }}>
            <Toolbar>
                <IconButton onClick={handleClose}>
                    <CloseIcon />
                </IconButton>
                <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
                    {"Event Details"}
                </Typography>
                <Button autoFocus color="inherit" onClick={handleSubmit(onSubmit)}>
                    Save
                </Button>
            </Toolbar>
        </AppBar>
        <div className='container-fluid'> 
            <div className='row'>
                <div className='col-lg-6 col-md-8 col-sm-12'>
                    <Controller name="name" control={control} 
                        render={({ field }) => 
                            <TextField margin='dense' error={isError(errors.name)} 
                            helperText={errors.name && errors.name.message} fullWidth label='Name' {...field} />} />
           
                </div>
            </div>
            <div className='row'>
                <div className='col-lg-6 col-md-8 col-sm-12'>
                    <Controller name="module" control={control} 
                        render={({ field }) => 
                            <FormControl error={isError(errors.module)} variant='standard' margin='dense' fullWidth>
                                    <InputLabel>Module</InputLabel>
                                    <NativeSelect {...field}>{getOptions('Modules')}</NativeSelect>
                                    {errors.module && <FormHelperText>{errors.module.message}</FormHelperText>}
                            </FormControl>} />
          
                </div>
            </div>
            <div className='row'>
                <div className='col-lg-6 col-md-8 col-sm-12'>
                    <Controller name="trigger" control={control} 
                        render={({ field }) => 
                            <FormControl error={isError(errors.trigger)} variant='standard' margin='dense' fullWidth>
                                <InputLabel shrink >Trigger Type</InputLabel>
                                <NativeSelect {...field}>{getOptions('Trigger')}</NativeSelect>
                                {errors.trigger && <FormHelperText>{errors.trigger.message}</FormHelperText>}
                            </FormControl>} />
          
                </div>
            </div>
            {
                trigger != "" && trigger == "Updated" && module != "" && moduleFields[module] &&
                 
                (
                <div className='row'>
                    <div className='col-lg-6 col-md-8 col-sm-12'>
                    <Controller name="changefield" control={control} 
                        render={({ field }) => 
                            <FormControl error={isError(errors.changefield)} variant='standard' margin='dense' fullWidth>
                                <InputLabel shrink >Change Field</InputLabel>
                                <NativeSelect {...field}>
                                    <option> </option>
                                    <option>All Fields</option>
                                    { moduleFields[module].map((x,idx)=>{   
                                           return (<option key={idx} >{x.name}</option>) 
                                       } ) 
                                }</NativeSelect>
                                {errors.changefield && <FormHelperText>{errors.changefield.message}</FormHelperText>}
                            </FormControl>} />
                    
             
                    </div>
                </div>
               )
                
            }
            {  trigger != "" && trigger == "Updated" && module != "" && moduleFields[module] && 
                typeof changefield != "undefined" && changefield != "All Fields" && changefield != "" &&
                moduleFields[module].find((x)=>{ return x.name == changefield }).values &&
                (    
                    <div className='row'>
                        <div className='col-lg-6 col-md-8 col-sm-12'>
                            <Controller name="changevaluefrom" control={control} 
                            render={({ field }) => 
                                <FormControl error={isError(errors.changevaluefrom)} variant='standard' margin='dense' fullWidth>
                                    <InputLabel shrink >Value From</InputLabel>
                                    <NativeSelect {...field}>
                                        <option></option>
                                        { moduleFields[module].find((x)=>{ return x.name == changefield })
                                            .values
                                            .filter((x)=>{ return !changevalueto || x != changevalueto  })
                                            .map((x,idx)=>{   
                                                return (<option key={idx} >{x}</option>) 
                                                } 
                                            ) 
                                        }
                                    </NativeSelect>
                                    {errors.changevaluefrom && <FormHelperText>{errors.changevaluefrom.message}</FormHelperText>}
                                </FormControl>} />
                            <Controller name="changevalueto" control={control} 
                            render={({ field }) => 
                                <FormControl error={isError(errors.changevalueto)} variant='standard' margin='dense' fullWidth>
                                    <InputLabel shrink >Value To</InputLabel>
                                    <NativeSelect {...field}>
                                        <option></option>
                                        { moduleFields[module].find((x)=>{ return x.name == changefield })
                                            .values
                                            .filter((x)=>{ return !changevaluefrom || x != changevaluefrom  })
                                            .map((x,idx)=>{   
                                                return (<option key={idx} >{x}</option>) 
                                                } 
                                            ) 
                                        }
                                    </NativeSelect>
                                    {errors.changevalueto && <FormHelperText>{errors.changevalueto.message}</FormHelperText>}
                                </FormControl>} />  
                        </div>
                    </div>
                )
            } 
            <div className='row'>
                <div className='col-lg-6 col-md-8 col-sm-12'>
                    <Controller name="notify" control={control} 
                        render={({ field }) => 
                            <FormControl error={isError(errors.notify)} variant='standard' margin='dense' fullWidth>
                                <InputLabel shrink >Notification Type</InputLabel>
                                <NativeSelect {...field}>{getOptions('Notify')}</NativeSelect>
                                {errors.notify && <FormHelperText>{errors.notify.message}</FormHelperText>}
                            </FormControl>} />
           

                </div>
            </div>
            <div className='row'>
                <div className='col-lg-6 col-md-8 col-sm-12'>
                    <Controller name="template" control={control} 
                        render={({ field }) => 
                        <FormControl required error={isError(errors["template"])} variant='standard' margin='dense' fullWidth>

                                <TemplateEditor settings={fields}   module={module} field={field} /> 
            
                            {errors["template"] && <FormHelperText>{errors["template"].message}</FormHelperText>}
                        </FormControl>} />
                            
                </div>
            </div>    
        </div>    
                 
    </Dialog>
    )
}
 