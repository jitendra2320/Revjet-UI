 import { Fragment, useState, useEffect } from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import AuthProvider from '../Authentication/authProvider'
//import PaymentTypes from './paymentType'
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import CrudView from '../../Utils/crud'
import { GetNotifcationFields, GetNoticeFields } from '../../REST/utilities'
import { AddAccount, GetAccount } from "../../REST/utilities";
import { GetById, UpdateItem, DeleteItem } from '../../REST/crud'
import PropertyTypes from '../Properties/types'
import Access from '../../Utils/authorize';
import FactSheet from './factsheet'
import Button from '@mui/material/Button';
import Inspection from '../Inspection';
import CreateInspection from '../Inspection/bpmn_form/createInspection';
import Notifications  from './notifications';



export default function Settings() {

    const navigate = useNavigate()
    const location = useLocation()

    const handleLink = (link) => navigate(link)

    console.log('Settings')

    return <Fragment>
        {location.pathname === '/settings' && (
            <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
                <Divider />
                <ListItem>
                    <ListItemButton onClick={() => handleLink('/settings/accounts')} dense>
                        <ListItemText primary={`Accounts`} />
                    </ListItemButton>
                </ListItem>
                <Divider />
                <ListItem>
                    <ListItemButton onClick={() => handleLink('/settings/documents')} dense>
                        <ListItemText primary={`Document Types`} />
                    </ListItemButton>
                </ListItem>
                <Divider />
                <ListItem>
                    <ListItemButton onClick={() => handleLink('/settings/insurances')} dense>
                        <ListItemText primary={`Insurance Types`} />
                    </ListItemButton>
                </ListItem>
                <Divider />
                <ListItem>
                    <ListItemButton onClick={() => handleLink('/settings/invoiceCycles')} dense>
                        <ListItemText primary={`Invoice Cycles`} />
                    </ListItemButton>
                </ListItem>
                <Divider />
                <ListItem>
                    <ListItemButton onClick={() => handleLink('/settings/paymentTypes')} dense>
                        <ListItemText primary={`Payment Types`} />
                    </ListItemButton>
                </ListItem>
                <Divider />
                <ListItem>
                    <ListItemButton onClick={() => handleLink('/settings/notifications')} dense>
                        <ListItemText primary={`Events`} />
                    </ListItemButton>
                </ListItem>
                <Divider />
                <ListItem>
                    <ListItemButton onClick={() => handleLink('/settings/notices')} dense>
                        <ListItemText primary={`Notices`} />
                    </ListItemButton>
                </ListItem>
                <Divider />
                <ListItem>
                    <ListItemButton onClick={() => handleLink('/settings/types')} dense>
                        <ListItemText primary={`Property Types`} />
                    </ListItemButton>
                </ListItem>
                <Divider />
                <ListItem>
                    <ListItemButton onClick={() => handleLink('/settings/attributes')} dense>
                        <ListItemText primary={`Property Attributes`} />
                    </ListItemButton>
                </ListItem>
                <Divider />
                <ListItem>
                    <ListItemButton onClick={() => handleLink('/settings/areas')} dense>
                        <ListItemText primary={`Property Areas`} />
                    </ListItemButton>
                </ListItem>
                <Divider />
                <ListItem>
                    <ListItemButton onClick={() => handleLink('/settings/factsheet')} dense>
                        <ListItemText primary={`Property FactSheet`} />
                    </ListItemButton>
                </ListItem>
                <Divider />
                <ListItem>
                    <ListItemButton onClick={() => handleLink('/settings/templates')} dense>
                        <ListItemText primary={`Notifications Sent`} />
                    </ListItemButton>
                </ListItem>
                <Divider />
                <ListItem>
                    <ListItemButton onClick={() => handleLink('/settings/systemsettings')} dense>
                        <ListItemText primary={`System Settings`} />
                    </ListItemButton>
                </ListItem>
                <Divider />
                <ListItem>
                    <ListItemButton onClick={() => handleLink('/settings/inspection')} dense>
                        <ListItemText primary={`Admin Inspection`} />
                    </ListItemButton>
                </ListItem>
                <Divider />
            </List>
        )}
        <Routes>
            <Route path='documents' element={<AuthProvider><DocumentTypeCrud /></AuthProvider>} />
            {/* Change Code in Insurance Types */}
            <Route path='insurances' element={<AuthProvider><InsuranceTypeCrud /></AuthProvider>} />
            <Route path='invoiceCycles' element={<AuthProvider><InvoiceCylesCrud /></AuthProvider>} />
            <Route path='paymentTypes' element={<AuthProvider><SkuTypesCrud /></AuthProvider>} />
            <Route path='notifications' element={<AuthProvider><NotificationsCrud /></AuthProvider>} />
            <Route path='accounts' element={<AuthProvider><AccountsCrud /></AuthProvider>} />
            <Route path='notices' element={<AuthProvider><NoticesCrud /></AuthProvider>} />
            <Route path='attributes' element={<AuthProvider><PropertyAttributesCrud /></AuthProvider>} />
            <Route path='areas' element={<AuthProvider><PropertyAreasCrud /></AuthProvider>} />
            <Route path='types' element={<AuthProvider><PropertyTypes /></AuthProvider>} />
            <Route path='templates' element={<AuthProvider><TemplateCrud /></AuthProvider>} />
            <Route path='factsheet' element={<AuthProvider><FactSheet /></AuthProvider>} />
            <Route path='systemsettings' element={<AuthProvider><SystemSettingCrud /></AuthProvider>} />
            <Route path='inspection'  element={<AuthProvider><Inspection /></AuthProvider>} />
            <Route path='inspection/createInspection/:id'  element={<AuthProvider><CreateInspection/></AuthProvider>} />
            <Route path='inspection/createInspection'  element={<AuthProvider><CreateInspection/></AuthProvider>} />
 
        </Routes>
    </Fragment>
}
const SystemSettingCrud = () =>{
    const schema = [
        { type: 'string', required: true, headerName: 'Name', flex: 0.5, field: 'name', grid: true },
        { type: 'string', required: true, headerName: 'Value', flex: 1, field: 'value', grid: true },
    ]

    return <CrudView controls={[]} deletable={Access.isAdmin('Settings')} editable={Access.isAdmin('Settings')} schema={schema} title='System Settings' type='SystemSetting' pageSize={10} />


}
const InsuranceTypeCrud = () => {

    const schema = [
        { type: 'string', required: true, headerName: 'Name', flex: 0.5, field: 'name', grid: true },
        { type: 'string', required: true, headerName: 'Description', flex: 1, field: 'description', grid: true },
    ]

    return <CrudView controls={[]} deletable={Access.isAdmin('Settings')} editable={Access.isAdmin('Settings')} schema={schema} title='Insurance Types' type='Insurances' pageSize={10} />

}

const InvoiceCylesCrud = () => {

    const schema = [
        { type: 'string', required: true, headerName: 'Name', flex: 0.5, field: 'name', grid: true },
        { type: 'string', required: true, headerName: 'Description', flex: 1, field: 'description', grid: true },
        { type: 'number', required: true, headerName: 'Due Days', flex: 1, field: 'dueDays', grid: true },
        { type: 'expression', required: true, headerName: 'Expression', flex: 1, field: 'expression', grid: true },
    ]   

    return <CrudView deletable={Access.isAdmin('Settings')} editable={Access.isAdmin('Settings')} schema={schema} title='InvoiceCycles' type='InvoiceCycles' pageSize={10} />

}

const DocumentTypeCrud = () => {

    const schema = [
        { type: 'string', required: true, headerName: 'Name', flex: 0.5, field: 'name', grid: true },
        { type: 'string', required: true, headerName: 'Description', flex: 1, field: 'description', grid: true },
    ]

    return <CrudView controls={[]} deletable={Access.isAdmin('Settings')} editable={Access.isAdmin('Settings')} schema={schema} title='Document Types' type='DocumentType' pageSize={10} />

}

const NotificationsCrud = () => {
    return <Notifications></Notifications>
    /*
    const [fields, setFields] = useState([])
    const [modules, setModules] = useState([])

    useEffect(() => {
        (async () => {
            const fields = await GetNotifcationFields()
            setModules(fields.data.map(e => Array.isArray(e) ? e[0].name : e.name))
            setFields(fields.data)
        })()
    }, [])


    const schema = [
        { type: 'string', required: true, headerName: 'Name', flex: 0.5, field: 'name', grid: true },
        { type: 'select', required: true, headerName: 'Module', flex: 1, field: 'module', grid: true, options: modules },
        { type: 'select', required: true, headerName: 'Trigger Type', flex: 1, field: 'trigger', grid: false, options: ['Created', 'Updated', 'Removed'] },
        { type: 'select', required: true, headerName: 'Notification Type', flex: 1, field: 'notify', grid: false, options: ['Internal', 'External', 'Both'] },
        { type: 'template', required: true, headerName: 'Template', flex: 1, field: 'template', grid: false, settings: fields, setValue: 'module' }
    ]

    return <CrudView deletable={Access.isAdmin('Settings')} editable={Access.isAdmin('Settings')} schema={schema} title='Notifications' type='Notifications' pageSize={10} />
    */
}

const NoticesCrud = () => {

    const [fields, setFields] = useState([])

    useEffect(() => {
        (async () => {
            const fields = await GetNoticeFields()
            setFields(fields.data)
        })()
    }, [])


    const schema = [
        { type: 'string', required: true, headerName: 'Name', flex: 0.5, field: 'name', grid: true },
        { type: 'string', required: true, headerName: 'Description', flex: 0.5, field: 'description', grid: true },
        { type: 'string', required: true, headerName: 'Key', flex: 0.5, field: 'key', grid: true },
        { type: 'select', required: true, headerName: 'Module', flex: 1, field: 'module', grid: true, options: ['Invoices', 'Waitlist', 'Company'] },
        { type: 'template', required: true, headerName: 'Template', flex: 1, field: 'template', grid: false, settings: fields, setValue: 'module' }
    ]

    return <CrudView deletable={Access.isAdmin('Settings')} editable={Access.isAdmin('Settings')} schema={schema} title='Notices' type='Notices' pageSize={10} />

}

const AccountsCrud = () => {
    const [refresh, setRefresh] = useState(false)

    const options = ['Company', 'Tiedown', 'Property', 'Lease', 'Invoices', 'Reports', 'Waitlist', 'Settings'].map(x => {
        return { _id: x, name: x }
    })

    const schema = [
        { type: 'string', required: true, headerName: 'Email', flex: 0.5, field: 'email', grid: true }, // disabled: true,
        {
            type: 'multiselect', required: true, headerName: 'Access', flex: 1, options, field: 'modules', grid: true, renderCell: (params) => {
                return <div style={{ overflow: 'auto' }} className='d-flex'>
                    {params.row.modules.map(x => <div key={x} className='px-2'>{x}</div>)}
                </div>
            }
        }
    ]

    const handleClick = (params) => {
        UpdateItem('Accounts', params.row.id, { ...params.row, modules: ['Company', 'Tiedown', 'Property', 'Lease', 'Invoices', 'Reports', 'Waitlist', 'Settings'], id: undefined }).then(resp => {
            setRefresh(!refresh)
        }).catch(err => console.log)

    }


    return <CrudView schema={schema} deletable={false} title='Accounts' type='Accounts' pageSize={10} controls={[
        {
            field: 'actions', headerName: '', flex: 0.5, renderCell: (params) => {
                return <Button variant='outlined' onClick={evt => { evt.stopPropagation(); handleClick(params) }
                }> Make Admin</Button >
            }
        }
    ]}
        services={{
            GetAll: GetAccount,
            GetId: GetById,
            Add: AddAccount,
            Update: UpdateItem,
            Delete: DeleteItem
        }} />

}

const SkuTypesCrud = () => {

    const schema = [
        { type: 'string', required: true, headerName: 'Name', flex: 0.5, field: 'name', grid: true },
        { type: 'string', required: true, headerName: 'Description', flex: 0.5, field: 'description', grid: true },
        { type: 'select', required: true, headerName: 'Sku Type', flex: 0.5, field: 'skuType', grid: true, options: [{ value: 'CPI', label: 'CPI Based' }, { value: 'Flat', label: 'Flat Rate' }, { value: 'Percent', label: 'Percentage' }] },
        { type: 'string', required: true, headerName: 'CPI/Flat Rate/Percent', flex: 0.5, field: 'skuValue', grid: true },
        { type: 'string', required: true, headerName: 'Late Fee (In %)', flex: 0.5, field: 'lateFee', grid: true },
    ]

    return <CrudView deletable={Access.isAdmin('Settings')} editable={Access.isAdmin('Settings')} schema={schema} title='Payment Type' type='SkuType' pageSize={10} />

}

const TemplateCrud = () => {

    const schema = [
        { type: 'string', required: true, headerName: 'Emails', flex: 0.5, field: 'emails', grid: true },
        { type: 'string', required: true, headerName: 'Subject', flex: 0.5, field: 'subject', grid: true },
        { type: 'date', required: true, headerName: 'Created On', flex: 0.5, field: 'createdAt', grid: true },
        { type: 'html', required: true, headerName: 'Body', flex: 0.5, field: 'html', grid: false },
    ]

    return <CrudView deletable={false} editable={true} schema={schema} title='Notifications Sent' type='Templates' pageSize={10} />

}


const PropertyAttributesCrud = () => {

    const schema = [
        { type: 'string', required: true, headerName: 'Name', flex: 1, field: 'name', grid: true },
        { type: 'string', required: true, headerName: 'Description', flex: 1, field: 'description', grid: true },
        { type: 'select', required: true, headerName: 'Attribute Type', flex: 1, field: 'attributeType', grid: true, options: [{ value: 'Text', label: 'Text' }, { value: 'Numeric', label: 'Numeric' }, { value: 'Date', label: 'Date' }] },
        { type: 'boolean', headerName: 'Allow Filtering', flex: 0.5, field: 'allowFiltering', grid: true },
        { type: 'boolean', headerName: 'Allow Sorting', flex: 0.5, field: 'allowSorting', grid: true },
    ]

    return <CrudView deletable={Access.isAdmin('Settings')} editable={Access.isAdmin('Settings')} schema={schema} title='Property Attribute' type='PropertyAttribute' pageSize={10} />

}

const PropertyAreasCrud = () => {

    const schema = [
        { type: 'string', required: true, headerName: 'Name', flex: 1, field: 'name', grid: true },
        { type: 'string', required: true, headerName: 'Description', flex: 1, field: 'description', grid: true },
    ]

    return <CrudView deletable={Access.isAdmin('Settings')} editable={Access.isAdmin('Settings')} schema={schema} title='Property Areas' type='PropertyArea' pageSize={10} />

}