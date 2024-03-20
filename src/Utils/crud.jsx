import React, { useState, useEffect, Fragment, useRef, forwardRef, useCallback } from 'react';
import {
    DataGrid, GridToolbarContainer,
    GridToolbarExport,
    gridClasses
} from '@mui/x-data-grid';
import { GetList, GetById, AddItem, UpdateItem, DeleteItem } from '../REST/crud'
import Button from '@mui/material/Button'
import AddIcon from '@mui/icons-material/Add'
import { useForm, Controller, useFormState } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from "yup";
import Dialog from '@mui/material/Dialog';
import {DateTimeControl} from '../Utils/datetimelocale';
 
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import NativeSelect from '@mui/material/NativeSelect';
import Select from '@mui/material/Select';

import FormHelperText from '@mui/material/FormHelperText';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import TextField from '@mui/material/TextField';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';
import Slide from '@mui/material/Slide';
//import Cron from 'react-cron-generator'
//import cronstrue from 'cronstrue';
import DeleteIcon from '@mui/icons-material/Delete';
import TemplateEditor from "../Utils/templates";
import BackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom'
import { handleErr } from '../helpers/errors';
import Scheduler from "material-ui-cron";


const REST = {
    GetAll: GetList,
    GetId: GetById,
    Add: AddItem,
    Update: UpdateItem,
    Delete: DeleteItem
}

function CustomToolbar() {
    return (
        <GridToolbarContainer className={gridClasses.toolbarContainer}>
            <GridToolbarExport />
        </GridToolbarContainer>
    );
}

export default function CrudView({ schema = [], type = 'NA', services = REST, title = 'Not Provided', onHandleClick, pageSize = 10, deletable = true, editable = true, controls = [] }) {
    const [columns, setColumns] = useState([])
    const [rows, setRows] = useState([])
    const [page, setPage] = useState(pageSize)
    const [open, setOpen] = useState(false)
    const [id, setId] = useState(null)
    const [refresh, setRefresh] = useState(false)
    const [buttons, setButtons] = useState([]);
    const [isAdd, setIsAdd] = useState(false)

    const navigate = useNavigate()
    const toggleRefresh = () => setRefresh(r => !r)

    useEffect(() => {
        const handleDelete = async (type, params) => {
            await services.Delete(type, params.id)
            toggleRefresh()
        }

        (async () => {
            const result = await services.GetAll(type)
            //const typeExp = schema.find(each => each.type === 'expression')
            setRows(result.data.map(e => {
                return { id: e._id, ...e }
            }))
        })()

        let newSchema = schema.filter(each => each.grid)
        const actions = {
            field: 'actions', headerName: 'Actions', flex: 0.5, renderCell: (params) => {
                return <IconButton onClick={(e) => { e.stopPropagation(); handleDelete(type, params) }}><DeleteIcon /></IconButton>
            }
        }
        if (buttons.length)
            newSchema = newSchema.concat(buttons)

        if (deletable) {
            newSchema = newSchema.concat(actions)
        }

        setColumns(newSchema.map(e => {
            const { type, required, ...otherProps } = e
            return otherProps
        }))

    }, [refresh, deletable, type, schema, services, buttons])

    useEffect(() => {
        if (controls.length)
            setButtons(controls)
    }, [controls])

    const handleLink = (id) => {
        if (typeof onHandleClick === 'function')
            onHandleClick(id)
        else {
            if (editable) {
                setOpen(true)
                setId(id)
            }
        }
    }

    const handleClose = () => {
        setOpen(false)
        setId(null)
        setRefresh(e => !e)
        setIsAdd(false)
    }

    // const getDesc = (val) => {
    //     try {
    //         return cronstrue.toString(val);
    //     }
    //     catch (ex) {
    //         console.log(ex, val)
    //         return 'NA'
    //     }
    // }

    const handleAdd = () => {
        setOpen(true)
        setIsAdd(true)
    }

    return (
        <div style={{ display: 'flex', height: 'calc(100% - 50px)' }}>
            <div style={{ flexGrow: 1 }}>
                {editable && <Button variant='outlined' onClick={handleAdd} endIcon={<AddIcon />}>
                    {title}
                </Button>}
                <Button style={{ float: 'right' }} variant='outlined' onClick={() => navigate(-1)} startIcon={<BackIcon />}>Back</Button>
                {open && <AddorUpdate id={id} handleClose={handleClose} title={title} open={open} rows={schema} services={services} type={type} isAdd={isAdd} />}
                <DataGrid
                    rows={rows}
                    columns={columns}
                    pageSize={page}
                    onPageSizeChange={(ps) => setPage(ps)}
                    rowsPerPageOptions={[5, 10, 15, 20]}
                    onRowClick={(p) => handleLink(p.id)}
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

function AddorUpdate({ open = false, handleClose, id = null, type = null, rows = [], title, services = REST, isAdd }) {


    const obj = {}
    const defaults = {}


    rows.forEach(e => {
        if (e.type === 'string' || e.type === 'select' || e.type === 'textarea') {
            obj[e.field] = yup.string()
            defaults[e.field] = ''
        }
        else if (e.type === 'number') {
            obj[e.field] = yup.number()
            defaults[e.field] = ''
        }
        else if (e.type === 'boolean') {
            obj[e.field] = yup.boolean()
            defaults[e.field] = false
        }
        else if (e.type === 'multiselect') {
            obj[e.field] = yup.array()
            defaults[e.field] = []
        }
        else {
            obj[e.field] = yup.string()
            defaults[e.field] = ''
        }
        if (e.required)
            obj[e.field] = obj[e.field].required()

    })

    const schema = yup.object(obj).required();

    const {register, control, handleSubmit, setError, formState: { errors }, clearErrors, reset, getValues } = useForm({
        defaultValues: defaults,
        resolver: yupResolver(schema)
    });

    const { isDirty } = useFormState({ control })


    useEffect(() => {
        (async () => {
            if (id) {
                const resp = await services.GetId(type, id)
                reset(resp.data)
            }
            else {
                clearErrors()
                reset()
            }
        })()
    }, [id, services, reset, type, clearErrors])

    useEffect(() => {
        reset(getValues())
    }, [isDirty, getValues, reset])


    useEffect(() => {
        clearErrors()
        reset()
    }, [open, clearErrors, reset])


    const getOptions = (opts = []) => {
        return [<option value='' key='temp'>Select One</option>].concat(opts.map((e, idx) => {
            if (typeof e === 'string')
                return <option key={idx} value={e}>{e}</option>
            return <option key={idx} value={e.value}>{e.label}</option>
        }))
    }

    const getController = (ctrl) => {
        const ctrlField = ctrl.field
        if (ctrl.type === 'select') {
            return <Controller key={ctrlField} name={ctrlField} control={control} render={({ field }) =>
                <FormControl error={isError(errors[ctrlField])} variant='standard' margin='dense' fullWidth required={ctrl.required}>
                    <InputLabel shrink>{ctrl.headerName}</InputLabel>
                    <NativeSelect {...field} >{getOptions(ctrl.options)}</NativeSelect>
                    {errors[ctrlField] && <FormHelperText>{errors[ctrlField].message}</FormHelperText>}
                </FormControl>} />
        }
        if (ctrl.type === 'ignore')
            return <p></p>
        if (ctrl.type === 'string')
            return <Controller key={ctrlField} name={ctrlField} control={control} render={({ field }) => <TextField disabled={field.value !== '' ? ctrl.disabled : false} variant='standard' margin='dense' error={isError(errors[ctrlField])} required={ctrl.required} helperText={errors[ctrlField] && errors[ctrlField].message} fullWidth label={ctrl.headerName} {...field} />} />
        if (ctrl.type === 'textarea')
            return <Controller key={ctrlField} name={ctrlField} control={control} render={({ field }) => <TextField multiline rows={4} variant='standard' margin='dense' error={isError(errors[ctrlField])} required={ctrl.required} helperText={errors[ctrlField] && errors[ctrlField].message} fullWidth label={ctrl.headerName} {...field} />} />
        if (ctrl.type === 'number')
            return <Controller key={ctrlField} name={ctrlField} control={control} render={({ field }) => <TextField variant='standard' margin='dense' error={isError(errors[ctrlField])} required={ctrl.required} helperText={errors[ctrlField] && errors[ctrlField].message} fullWidth label={ctrl.headerName} {...field} />} type='number' />
        if (ctrl.type === 'boolean')
            return <Controller key={ctrlField} name={ctrlField} control={control} render={({ field }) => <FormControlLabel {...field} control={<Checkbox checked={field.value} required={ctrl.required} />} label={ctrl.headerName} />} />
        if (ctrl.type === 'date')
            return <Controller     control={control} key={ctrlField} name={ctrlField}  
            render={({ field }) => 
                 <DateTimeControl register={register} label={ctrl.headerName} errors={errors} field={field} />} />

            
        if (ctrl.type === 'expression')
            return <Controller key={ctrlField} name={ctrlField} control={control} render={({ field }) => {
                const { name, value, onChange } = field
                if (value && !isAdd)
                    return <CronInputUpdate errors={errors} field={field} isAdd={isAdd} />
                else {
                    if (isAdd)
                        return <CronInputAdd errors={errors} field={field} isAdd={isAdd} />
                    else return null
                }
            }
            } />
        if (ctrl.type === 'template')
            return <Controller key={ctrlField} name={ctrlField} control={control} render={({ field }) => <TemplateEditor settings={ctrl.settings} errors={errors} module={getValues(ctrl.setValue)} field={field} />} />
        //multiselect
        if (ctrl.type === 'multiselect')
            return <Controller key={ctrlField} name={ctrlField} control={control} render={({ field }) =>
                <FormControl error={isError(errors[ctrlField])} variant='standard' margin='dense' fullWidth required={ctrl.required}>
                    <InputLabel shrink>{ctrl.headerName}</InputLabel>
                    <Select onChange={(evt) => {
                        const x = evt.target.value
                        let y = [...field.value]
                        if (y.includes(x))
                            y = y.filter(r => r !== x)
                        else
                            y.push(x)
                        field.onChange(y)
                    }} multiple={true} native={true} value={field.value} >
                        {ctrl.options.map((e, idx) => {
                            const { _id, name } = e
                            return <option key={_id} value={_id}>{name}</option>
                        })}
                    </Select>
                    {errors[ctrlField] && <FormHelperText>{errors[ctrlField].message}</FormHelperText>}
                </FormControl>} />
        if (ctrl.type === 'html')
            return <Controller key={ctrlField} name={ctrlField} control={control} render={({ field }) => <div className='card p-2' dangerouslySetInnerHTML={{ __html: field.value }} />} />

    }

    const isError = (val) => val !== undefined && val !== null && typeof val === 'object'

    const handleMultiSelects = () => {
        const mults = rows.filter(each => each.type === 'array')
        return mults.reduce((accum, each) => {
            const { field, inputProps } = each
            const options = document.getElementById(inputProps.id).selectedOptions
            const values = Array.from(options).map(({ value }) => value);
            accum[field] = values
            return accum
        }, {})
    }

    const onSubmit = (data) => {
        (async () => {
            const mults = handleMultiSelects();
            if (id) {
                const resp = await services.Update(type, id, { ...data, ...mults }).catch((err) => {
                    handleErr(err, setError)
                })
                if (resp) handleClose()
            } else {
                const resp = await services.Add(type, { ...data, ...mults }).catch((err) => {
                    handleErr(err, setError)
                })
                if (resp) handleClose()
            }
        })()
    }


    return <Dialog fullScreen open={open} onClose={handleClose} TransitionComponent={Transition}>
        <AppBar sx={{ position: 'relative' }}>
            <Toolbar>
                <IconButton onClick={handleClose}>
                    <CloseIcon />
                </IconButton>
                <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
                    {title}
                </Typography>
                <Button autoFocus color="inherit" onClick={handleSubmit(onSubmit)}>
                    Save
                </Button>
            </Toolbar>
        </AppBar>
        <div className='container-fluid'>
            <div className='row'>
                <div className='col-lg-6 col-md-8 col-sm-12'>
                     
                        {rows.map(e => {
                            return getController(e)
                        })}
                      
                </div>
            </div>
        </div>
    </Dialog>
}


// function CronInput({ errors, field }) {

//     console.log(field)

//     return <Fragment>
//         <Cron {...field} showResultText={true}
//             showResultCron={true} />
//         <span>
//         </span>
//     </Fragment>
// }

function CronInputUpdate({ errors, field }) {

    const { name, value, onChange } = field
    const [cronExp, setCronExp] = React.useState(value)
    const [cronError, setCronError] = React.useState('') // get error message if cron is invalid
    const [isAdmin, setIsAdmin] = React.useState(true) // set admin or non-admin to enable or disable high frequency scheduling (more than once a day)

    console.log('cronexp', cronExp, field)

    useEffect(() => {
        onChange(cronExp)
    }, [cronExp])

    return (
        <Scheduler
            cron={cronExp}
            setCron={setCronExp}
            setCronError={setCronError}
            isAdmin={isAdmin}
        />
    )


    // const { name, value, onChange } = field
    // const [cronExp, setCronExp] = React.useState('0 0 1 * *')
    // const [cronError, setCronError] = React.useState('') // get error message if cron is invalid
    // const [isAdmin, setIsAdmin] = React.useState(true) // set admin or non-admin to enable or disable high frequency scheduling (more than once a day)

    // console.log('cronexp', cronExp, field)

    // useEffect(() => {
    //     onChange(cronExp)
    // }, [cronExp])

    // if (value === '0 0 1 * *')
    //     return (
    //         <Scheduler
    //             cron={cronExp}
    //             setCron={setCronExp}
    //             setCronError={setCronError}
    //             isAdmin={isAdmin}
    //         />
    //     )
    // else
    //     return (
    //         <Scheduler
    //             cron={value}
    //             setCron={setCronExp}
    //             setCronError={setCronError}
    //             isAdmin={isAdmin}
    //         />
    //     )



    // const { name, value, onChange } = field
    // const [cronExp, setCronExp] = React.useState(' 0 0 1 * *')
    // const [cronError, setCronError] = React.useState('') // get error message if cron is invalid
    // const [isAdmin, setIsAdmin] = React.useState(true) // set admin or non-admin to enable or disable high frequency scheduling (more than once a day)

    // console.log('cronexp', cronExp, field)

    // useEffect(() => {
    //     setCronExp(value)
    // }, [value])


    // useEffect(() => {
    //     onChange(cronExp)
    // }, [cronExp])

    // return (
    //     <Scheduler
    //         cron={cronExp}
    //         setCron={setCronExp}
    //         setCronError={setCronError}
    //         isAdmin={isAdmin}
    //     />
    // )




    // const inputRef = useRef(null);
    // const defaultValue = "*/2 */2 */2 * *";
    // const [value, setValue] = useState(defaultValue);
    // const customSetValue = useCallback(
    //     (newValue) => {
    //       setValue(newValue);
    //       inputRef.current && inputRef.current.setValue(newValue);
    //     },
    //     [inputRef]
    //   );

    // return (
    //     <div>
    //         <Cron value={value} setValue={customSetValue} />
    //         <span style={{ fontSize: 12 }}>
    //             <i className="info icon info-icon" style={{ marginRight: 5 }} />
    //             <span>
    //                 Double click on a value to automatically select / unselect a
    //                 periodicty
    //             </span>
    //         </span>
    //     </div>
    // );
}

function CronInputAdd({ errors, field }) {

    const { name, value, onChange } = field
    const [cronExp, setCronExp] = React.useState('0 0 * * *')
    const [cronError, setCronError] = React.useState('') // get error message if cron is invalid
    const [isAdmin, setIsAdmin] = React.useState(true) // set admin or non-admin to enable or disable high frequency scheduling (more than once a day)

    console.log('cronexp', cronExp, field)

    useEffect(() => {
        onChange(cronExp)
    }, [cronExp])

    return (
        <Scheduler
            cron={cronExp}
            setCron={setCronExp}
            setCronError={setCronError}
            isAdmin={isAdmin}
        />
    )
}

