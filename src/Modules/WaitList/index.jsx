import React, { Fragment, useEffect, useState } from 'react'
import Button from '@mui/material/Button'
import {
    DataGrid, GridToolbarContainer,
    GridToolbarExport,
    gridClasses,
} from '@mui/x-data-grid';
import Documents from '../Utilities/documents';
import Remarks from '../Utilities/remarks';
import ButtonGroup from '@mui/material/ButtonGroup';
import { GetWaitListById, AddDocument, AddRemark, ModifyWaitListApplicant, DeleteWaitListApplicant, CreateAccount, GetWaitListByType } from '../../REST/waitList';
import { GetPropertyTypes } from '../../REST/properties';
import {GetWaitLists } from '../../REST/waitList'
import moment from 'moment';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import { getOptions } from '../Agreements'
import Select from '@mui/material/Select';
import IconButton from '@mui/material/IconButton';
import ChatIcon from '@mui/icons-material/ChatBubble';
import ArrowRight from '@mui/icons-material/ArrowRight';
import MessageDialog from '../Messages';
import BackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import Badge from '@mui/material/Badge';

import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import { Routes, Route, useNavigate, useLocation, useParams } from 'react-router-dom'
import AuthProvider from '../Authentication/authProvider';
import { handleCtrlErr } from '../../helpers/errors';
import FormHelperText from '@mui/material/FormHelperText';
import { Edit } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers';
import dayjs, { Dayjs } from 'dayjs';
import {Tooltip} from "@mui/material";




function CustomToolbar() {
    return (
        <GridToolbarContainer className={gridClasses.toolbarContainer}>
            <GridToolbarExport />
        </GridToolbarContainer>
    );
}

export default function WaitList() {
    const navigate = useNavigate()
    const location = useLocation()

    const handleLink = (link) => navigate(link)

    const [prpTypes, setPrpTypes] = useState([])
    const [waitLists, setWaitLists] = useState([])
    const [weekDate, setWeekDate] = useState([])

    console.log('dateeee', new Date().toISOString)

    useEffect(() => {
        (async () => {
            const types = await GetPropertyTypes()
            const waitListApplicants = await GetWaitLists()
            setPrpTypes(types.data)
            setWaitLists(waitListApplicants.data)

            var curr = new Date(); // get current date
    var first = curr.getDate() - curr.getDay();
    first = first - 6
    var firstdayOb = new Date(curr.setDate(first));
    var firstday = firstdayOb.toISOString();
    setWeekDate( firstday);
    console.log(firstday,'firstday')
   
        })()
    }, [])
    console.log('waitList>>>>' , waitLists);

    

//console.log('waitLists',  waitLists);
    return <Fragment>
        {location.pathname === '/waitList' && (
            <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
                {prpTypes.map((each, idx) => {
                    const { name, _id } = each
                    return <div key={idx}>
                        <Divider />
                        <ListItem >
                            <ListItemButton onClick={() => handleLink('/waitList/type/' + _id)} dense>
                                <ListItemText primary={name} style={{width:"40%"}}   />
                                <ListItemSecondaryAction>
                                    {
                                        waitLists.filter(item => item?.propertyType == _id).length > 0 &&
                                        <Badge 
                                            badgeContent={
                                                <Tooltip title='Current Waitlist'>
                                                    <span>
                                                        {waitLists.filter(item => item?.propertyType == _id).length > 0 ? waitLists.filter(item => item?.propertyType == _id).length : '' }
                                                    </span>
                                                </Tooltip>} 
                                            color="primary">
                                        <div></div>
                                        </Badge>
                                    }
                                    {
                                        waitLists.filter(item => item?.joiningDate && item?.propertyType == _id && new Date(weekDate)?.getTime() <= new Date(item?.joiningDate).getTime() && new Date()?.getTime()  >= new Date(item?.joiningDate).getTime()).length > 0
                                        &&
                                        <Badge 
                                            badgeContent={
                                                <Tooltip title='Joined this Week'>
                                                    <span>
                                                        {waitLists.filter(item => item?.joiningDate && item?.propertyType == _id && new Date(weekDate)?.getTime() <= new Date(item?.joiningDate).getTime() && new Date()?.getTime()  >= new Date(item?.joiningDate).getTime()).length > 0 ?
                                                        waitLists.filter(item => item?.joiningDate &&  item?.propertyType == _id &&
                                                        new Date(weekDate)?.getTime() <= new Date(item?.joiningDate).getTime() && new Date()?.getTime()  >= new Date(item?.joiningDate).getTime()).length : ''}
                                                   </span>
                                                </Tooltip>
                                            } 
                                        
                                            color="secondary">
                                            <div>{'\u00A0'}{'\u00A0'}{'\u00A0'}{'\u00A0'}</div>
                                        </Badge>
                                    }
                                </ListItemSecondaryAction>
                                
                            </ListItemButton>
                        </ListItem>
                        <Divider />
                    </div>
                })}
            </List>
        )}
        <Routes>
            <Route path='type/:id' element={<AuthProvider><WaitListGrid /></AuthProvider>} />
            <Route path=':id' element={<AuthProvider><UpdateWaitListApplicant /></AuthProvider>} />
            {/* <Route path='types' element={<AuthProvider><PropertyTypesCrud /></AuthProvider>} />
            <Route path='attributes' element={<AuthProvider><PropertyAttributesCrud /></AuthProvider>} />
            <Route path='areas' element={<AuthProvider><PropertyAreas /></AuthProvider>} />
            <Route path='listings' element={<AuthProvider><PropertyListings /></AuthProvider>} />
            <Route path='listings/add' element={<AuthProvider><AddListing /></AuthProvider>} />
            <Route path='listings/:id' element={<AuthProvider><UpdateListing /></AuthProvider>} /> */}
        </Routes>
    </Fragment>
}
function WaitListGrid() {

    const navigate = useNavigate()
    const [rows, setRows] = useState([])
    const [chat, setChat] = useState(null)
    const [page, setPage] = useState(10)
    //const [prpTypes, setPrpTypes] = useState([])
    const { id } = useParams()
    const [sortModel, setSortModel] = React.useState([
        {
          field: 'joinedDate',
          sort: 'desc',
        },
      ]);
      
    console.log(id)

    const columns = [
        { field: 'pos', headerName: 'Queue #', flex: 0.5 },
        { field: 'firstName', headerName: 'First Name', flex: 0.5 },
        { field: 'lastName', headerName: 'Last Name', flex: 0.5 },
        { field: 'joinedDate', headerName: 'Date Joined', flex: 0.5 },
        { field: 'phone', headerName: 'Phone Number', flex: 0.5 },
        { field: 'email', headerName: 'Email', flex: 0.5 },
        { field: 'organization', headerName: 'Organization', flex: 0.5 },
        { field: 'status', headerName: 'Status', flex: 0.5 },
        { field: 'prpType', headerName: 'Property Type', flex: 0.5 },
        {
            field: 'chat', headerName: 'Chat', width: 100, renderCell: (params) => {
                return <IconButton onClick={() => setChat(params.id)}><ChatIcon /></IconButton>
            }
        },
        {
            field: 'view', headerName: 'Edit', width: 100, renderCell: (params) => {
                return <IconButton onClick={() => handleLink(params.id)}><Edit /></IconButton>
            }
        }
    ];

    useEffect(() => {
        (async () => {
            const types = await GetPropertyTypes()
            const result = await GetWaitListByType(id)
            //setPrpTypes(types.data)
            setRows(result.data.map((e, idx) => {
                const typeofProp = types.data.find(each => each._id === e.propertyType)
                return { ...e, id: e._id, pos: idx + 1, joinedDate: moment(e?.joiningDate).format('MM/DD/YYYY'), prpType: typeofProp ? typeofProp.name : '' }
            }))
        })()
    }, [id])

    const handleLink = (id) => navigate('/waitlist/' + id)

    return (
        <div style={{ display: 'flex', height: '100%' }}>
            <div style={{ flexGrow: 1 }}>
                {chat !== null && <MessageDialog open={chat !== null} handleClose={() => setChat(null)} id={chat} />}
                <DataGrid
                    rows={rows}
                    columns={columns}
                    pageSize={page}
                    rowsPerPageOptions={[5, 10, 15, 20]}
                    onPageSizeChange={e => setPage(e)}
                    components={{
                        Toolbar: CustomToolbar,
                    }}
                    sortModel={sortModel}
                    onSortModelChange={(model) => setSortModel(model)}
                //   onRowClick={(p) => handleLink(p.id)}
                />
            </div>
        </div>
    );
}

export function UpdateWaitListApplicant() {
    const { id } = useParams()
    const [data, setData] = useState({})
    const [refresh, setRefresh] = useState(false)
    const [status, setStatus] = useState('')
    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [phoneNum, setPhoneNum] = useState('')
    const [email, setEmail] = useState('')
    const [organization, setOrganization] = useState('')




    const [joinedDate, setJoinDate] = useState('')

    const [errors, setErrors] = useState({})
    const navigate = useNavigate()

    const toggleRefresh = () => setRefresh(r => !r)

    useEffect(() => {
        toggleRefresh()
    }, [])

    useEffect(() => {
        (async () => {
            const result = await GetWaitListById(id)
            const res = await GetPropertyTypes()
            setData({ ...result.data, propertyType: res.data.find(each => each._id === result.data.propertyType).name })
            setStatus(result.data.status)
            setFirstName(result.data.firstName)
            setLastName(result.data.lastName)
            setPhoneNum(result.data.phone)
            setEmail(result.data.email)
            setOrganization(result.data.organization)
            setJoinDate(moment(result.data?.joiningDate).format('MM/DD/YYYY'))
            resetErrors()
        })()
    }, [refresh, id])

    const addDocument = (doc) => AddDocument(id, doc).then(toggleRefresh)
    const addRemark = (doc) => AddRemark(id, doc).then(toggleRefresh)
    const resetErrors = () => setErrors({})


    const handleDelete = async () => {
        await DeleteWaitListApplicant(data._id)
        navigate('/waitlist')
    }


    const handleAccount = async () => {
        const res = await CreateAccount(data).catch((err) => {
            handleCtrlErr(err, setErrors)
        })
        if (res) navigate('/companies/' + res.data._id)
    }

    const handleSave = async () => {
        const res = await ModifyWaitListApplicant({ ...data, status: status, email : email,firstName: firstName,lastName: lastName, phone: phoneNum,organization: organization, joiningDate: joinedDate}).catch((err) => {
            handleCtrlErr(err, setErrors)
        })
        if (res) setData(res.data)
    }

    const handleChange = (e) => { setStatus(e.target.value); 
        resetErrors() }

    const isError = (val) => val !== undefined && val !== null

    console.log('errors', errors)
console.log('data>>>>>', data);
    return (
        <div className='row'>
            <div className='col-6'>
                <TextField margin='dense' disabled name='propertyType' value={data.propertyType ?? " "} fullWidth label='Property Type' error={isError(errors['propertyType'])} helperText={errors['propertyType']} />
                <TextField margin='dense'  name='firstName' value={firstName}  onChange={evt => setFirstName(evt.target.value)} fullWidth label='First Name' error={isError(errors['firstName'])} helperText={errors['firstName']} />
                <TextField margin='dense'  name='lastName' value={lastName}  onChange={evt => setLastName(evt.target.value)} fullWidth label='Last Name' error={isError(errors['lastName'])} helperText={errors['lastName']} />
                <TextField margin='dense'  name='phone' value={phoneNum}  onChange={evt => setPhoneNum(evt.target.value)} fullWidth label='Phone Number' error={isError(errors['phone'])} helperText={errors['phone']} />
                <TextField margin='dense'  name='email' value={email}  onChange={evt => setEmail(evt.target.value)} fullWidth label='Email' error={isError(errors['email'])} helperText={errors['email']} />
                <TextField margin='dense'  name='organization' value={organization} onChange={evt => setOrganization(evt.target.value)} fullWidth label='Organization' error={isError(errors['organization'])} helperText={errors['organization']} />
                <FormControl fullWidth  style={{marginTop:'8px'}}>
                <DatePicker 
                margin= 'dense'
                name='joinDate'
                    label="Join Date"
                    value={dayjs(joinedDate)}
                    onChange={(newValue) => 
                        setJoinDate(newValue.toDate())}
                    
                />
                </FormControl>

                <FormControl fullWidth style={{marginTop:'8px'}} error={isError(errors['status'])}>
                    <InputLabel  shrink id="demo-simple-select-label">Status</InputLabel>
                    <Select
                        native
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        value={status ?? " "}
                        label="Status"
                        onChange={handleChange}
                    >
                        {getOptions(['Unpaid', 'Paid', 'InProgress'])}
                    </Select>
                    <FormHelperText>{errors['status']}</FormHelperText>
                </FormControl>

                <div className='mt-4'>
                    <ButtonGroup variant="contained" aria-label="outlined primary button group">
                        <Button variant="outlined" startIcon={<SaveIcon />} onClick={handleSave}>
                            SAVE
                        </Button>
                        <Documents docIds={data.documents} onUpload={res => addDocument(res._id)} module="Waitlist" />
                        <Remarks docIds={data.remarks} onUpload={res => addRemark(res._id)} fullWidth={true} module="Waitlist" />
                        <Button variant="outlined" startIcon={<DeleteIcon />} onClick={handleDelete}>
                            Delete Applicant
                        </Button>
                        <Button variant="outlined" startIcon={<AddCircleIcon />} onClick={handleAccount}>
                            Create Account
                        </Button>
                    </ButtonGroup>
                </div>
            </div>
            <div className='col-6'>
                <Button style={{ float: 'right' }} variant='outlined' onClick={() => navigate(-1)} startIcon={<BackIcon />}>Back</Button>
            </div>
        </div>

    )


}

