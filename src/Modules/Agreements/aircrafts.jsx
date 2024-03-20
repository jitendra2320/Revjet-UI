
import React, { Fragment } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import IconButton from '@mui/material/IconButton';
import FlightIcon from '@mui/icons-material/Flight';
import CRUDView from '../../Utils/crud';
import { GetAirCrafts, GetAirCraftById, AddAirCraft, UpdateAirCraft, DeleteAirCraft } from '../../REST/properties';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';

function AirCrafts({ id, agreement }) {

    const schema = [
        { type: 'string', required: true, headerName: 'Tail Number', flex: 0.5, field: 'tailNumber', grid: true },
        { type: 'string', required: true, headerName: 'Make', flex: 0.5, field: 'make', grid: true },
        { type: 'string', required: true, headerName: 'Model', flex: 0.5, field: 'model', grid: true },
        { type: 'select', required: true, headerName: 'Aircraft Type', flex: 0.5, field: 'airCraftType', grid: true, options: [{ value: 'Single-Engine', label: 'Single-Engine' }, { value: 'Multi-Engine', label: 'Multi-Engine' }, { value: 'Jet', label: 'Jet' }, { value: 'Helicopter', label: 'Helicopter' }, { value: 'Glider', label: 'Glider' }, { value: 'Ultralight', label: 'Ultralight' },{ value: 'Military', label: 'Military' },{ value: 'Non-Non-50105010', label: 'Non-5010' }] },
        { type: 'string', required: true, headerName: 'Owner', flex: 0.5, field: 'owner', grid: true },
        { type: 'string', required: true, headerName: 'Address1', flex: 0.5, field: 'address1', grid: true },
        { type: 'string', required: true, headerName: 'Address2', flex: 0.5, field: 'address2', grid: true },
        { type: 'select', required: true, headerName: 'Insurance', flex: 0.5, field: 'insurance', grid: false, options: [{ value: 'Approved', label: 'Approved' }, { value: 'Not Approved', label: 'Not Approved' }, { value: 'N/A', label: 'N/A' }] },
        { type: 'textarea', required: true, headerName: 'Comments', flex: 0.5, field: 'comments', grid: false },
        { type: 'string', required: true, headerName: 'faaRegistry', flex: 0.5, field: 'faaRegistry', grid: false },
    ]

    const REST = {
        GetAll: (args) => GetAirCrafts(id, agreement),
        GetId: (args, id) => GetAirCraftById(id),
        Add: (args, entity) => AddAirCraft(id, agreement, entity),
        Update: (args, id, entity) => UpdateAirCraft(id, agreement, entity),
        Delete: (args, id) => {
            console.log(id)
            DeleteAirCraft(id)
        }

    }

    return <CRUDView title='Based Aircraft' pageSize={10} schema={schema} services={REST} />
}

export default function AirCraftList({ id, agreement, icon = false }) {
    const [open, setOpen] = React.useState(false);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    return (
        <Fragment>
            {!icon && <Button variant="outlined" startIcon={<FlightIcon />} onClick={handleClickOpen}>
                Based Aircraft
            </Button>}
            {icon && <IconButton onClick={handleClickOpen} edge="end">
                <FlightIcon />
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
                            Based Aircraft
                        </Typography>
                    </Toolbar>
                </AppBar>
                <AirCrafts id={id} agreement={agreement} />
            </Dialog>
        </Fragment>
    );
}

