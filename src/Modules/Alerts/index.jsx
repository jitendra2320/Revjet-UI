import * as React from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { GetAlerts, GetUsers, CreateAlerts } from '../../REST/alert'
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import OutlinedInput from '@mui/material/OutlinedInput';
import MenuItem from '@mui/material/MenuItem';
import ListItemText from '@mui/material/ListItemText';
import Select from '@mui/material/Select';
import Checkbox from '@mui/material/Checkbox';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import DetailsView from './details'
import Access from '../../Utils/authorize';
import DOMPurify from 'dompurify';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
    PaperProps: {
        style: {
            maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
            width: 250,
        },
    },
};

function MessageDialog({ open, handleClose }) {
    const [type, setType] = React.useState('NONE')
    const [items, setItems] = React.useState([]);
    const [select, setSelect] = React.useState([]);
    const [subject, setSubject] = React.useState('')
    const [body, setBody] = React.useState('')

    const handleChange = (event) => {
        const {
            target: { value },
        } = event;
        setSelect(
            // On autofill we get a stringified value.
            typeof value === 'string' ? value.split(',') : value,
        );
    };

    const handleType = (event, value) => {
        GetUsers(value).then(resp => {
            setType(value);
            setItems(resp.data)
            setTimeout(() => {
                if (value !== 'NONE')
                    setSelect(resp.data.map(x => x._id))
                else
                    setSelect([])
            }, 100)
        }).catch(err => console.log)
    };

    const handleSend = () => {
        CreateAlerts({ userIds: select, subject, body }).then(resp => {
            console.log(resp.data)
            handleClose()
        }).catch(err => console.log)
    }

    return (
        <Dialog fullWidth open={open} onClose={handleClose}>
            <DialogTitle>Send a Message</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    <ToggleButtonGroup
                        color="primary"
                        value={type}
                        exclusive
                        onChange={handleType}
                        fullWidth
                    >
                        <ToggleButton value="ALL">All Users</ToggleButton>
                        <ToggleButton value="COMPANIES">Companies</ToggleButton>
                        <ToggleButton value="ACTIVE">Active Companies</ToggleButton>
                        <ToggleButton value="INTERNAL">Internal Users</ToggleButton>
                        <ToggleButton value="APPLICANTS">All Applicants</ToggleButton>
                        <ToggleButton value="NONE">Select User</ToggleButton>
                    </ToggleButtonGroup>
                    <Select
                        multiple
                        fullWidth
                        value={select}
                        label='Select Users'
                        margin='dense'
                        onChange={handleChange}
                        input={<OutlinedInput label="Tag" />}
                        renderValue={(selected) => selected.map(x => (items.find(y => y._id === x) || {}).email).join(',')}
                        MenuProps={MenuProps}
                    >
                        {items.map((x) => (
                            <MenuItem key={x._id} value={x._id}>
                                <Checkbox checked={select.indexOf(x._id) > -1} />
                                <ListItemText primary={x.email} />
                            </MenuItem>
                        ))}
                    </Select>
                    <TextField value={subject} onChange={evt => setSubject(evt.target.value)} margin='dense' label='Subject' fullWidth />
                    <TextField value={body} onChange={evt => setBody(evt.target.value)} margin='dense' label='Message' minRows={4} fullWidth multiline />
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>
                <Button onClick={handleSend}>Send</Button>
            </DialogActions>
        </Dialog>
    );
}



export default function DataTable() {
    const [rows, setRows] = React.useState([]);
    const [open, setOpen] = React.useState(false);
    const [selected, setSelected] = React.useState(null);
    const [refresh, setRefresh] = React.useState(false);
    const [ids, setIds] = React.useState([])

    const columns = [
        {
            field: 'date', headerName: 'Date', flex: 0.5, renderCell: (params) => {
                return params.row.isNew ? <b>{new Date(params.row.date).toLocaleDateString()}</b> : new Date(params.row.date).toLocaleDateString()
            }
        },
        {
            field: 'subject', headerName: 'Type', flex: 0.5, renderCell: (params) => {
                return params.row.isNew ? <b>{params.row.subject}</b> : params.row.subject
            }
        },
        {
            field: 'isNew', headerName: 'View', renderCell: (params) => {
                return <Button onClick={(evt) => {
                    setSelected(params.row.id)
                    evt.stopPropagation()
                }} variant='outlined'>View</Button>
            }
        }
    ];

    React.useEffect(() => {
        GetAlerts().then(resp => {
            setRows(resp.data.map(e => {
                return { date: e.createdAt, subject: e.subject, message: e.message, isNew: e.isNew, id: e._id }
            }))
        }).catch(err => console.log)
    }, [refresh])

    const handleExport = () => {
        let mywindow = window.open('', 'PRINT', 'height=400,width=600');
        mywindow.document.write('<html><head><title>' + document.title + '</title>');
        mywindow.document.write('</head><body >');

        rows.filter(e => ids.includes(e.id)).forEach(x => {
            mywindow.document.write(DOMPurify.sanitize('<h2>' + x.subject + '</h2>'));
            mywindow.document.write(DOMPurify.sanitize('<h4>' + new Date(x.date).toLocaleString() + '</h4>'));
            mywindow.document.write(DOMPurify.sanitize('<p>' + x.message + '</p>'));
            mywindow.document.write(DOMPurify.sanitize('<hr/>'));
        })

        mywindow.document.write('</body></html>');
        mywindow.document.close(); // necessary for IE >= 10
        mywindow.focus(); // necessary for IE >= 10*/

        mywindow.print();
        mywindow.close();
        return true;
    }

    return <React.Fragment>
        <h4>Messages {Access.isInternal() === true && <Button onClick={() => setOpen(true)} variant='outlined'>Create Notification</Button>}</h4>
        {ids.length > 0 && <Button variant='outlined' onClick={handleExport}>Export Selected</Button>}
        {open && <MessageDialog open={open} handleClose={() => { setOpen(false); setRefresh(!refresh) }} />}
        {selected != null && <DetailsView open={selected != null} handleClose={() => { setSelected(null); setRefresh(!refresh) }} item={rows.find(x => x.id === selected)} />}
        <div style={{ height: '95%', width: '100%' }}>
            <DataGrid
                rows={rows}
                columns={columns}
                pageSize={10}
                rowsPerPageOptions={[5, 10, 15]}
                checkboxSelection
                onSelectionModelChange={(ids) => setIds(ids)}
            />
        </div>
    </React.Fragment>
}
