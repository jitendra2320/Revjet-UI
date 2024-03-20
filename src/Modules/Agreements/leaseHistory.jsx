import React, { useEffect, useState } from 'react'
import { GetAgreementsByIds } from '../../REST/agreements'
import {
    DataGrid, GridToolbarContainer,
    GridToolbarExport,
    gridClasses,
} from '@mui/x-data-grid';
import { useNavigate, useParams } from 'react-router-dom'
import { GetProperty } from '../../REST/properties';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';
import Slide from '@mui/material/Slide';
import HistoryIcon from '@mui/icons-material/History';

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

function CustomToolbar() {
    return (
      <GridToolbarContainer className={gridClasses.toolbarContainer}>
        <GridToolbarExport />
      </GridToolbarContainer>
    );
  }

export default function LeaseHistory() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [rows, setRows] = useState([])
    const [open, setOpen] = useState(false);
    const [page, setPage] = useState(10)

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };


    const columns = [
        { field: 'id', headerName: 'ID', flex: 0.5, hide: true },
        { field: 'title', headerName: 'Agreement Title', flex: 0.5 },
        { field: 'agreementNum', headerName: 'Agreement Number', flex: 0.5 },
        { field: 'startDate', headerName: 'Begin Date', flex: 0.5 },
        { field: 'endDate', headerName: 'End Date', flex: 0.5 },
        { field: 'status', headerName: 'Status', flex: 0.5 },
    ];

    useEffect(() => {
        (async () => {
            const res = await GetProperty(id)
            const result = await GetAgreementsByIds(res.data.tenants.map(each => each.agreementId))
            if (Array.isArray(result.data))
                setRows(result.data.map(e => {
                    return { ...e, id: e._id }
                }))
        })()
    }, [id])

    const handleLink = (id) => navigate('/agreements/' + id)

    return (
        <div style={{ display: 'flex', height: '100%' }}>
            <Button variant="outlined" startIcon={<HistoryIcon />} onClick={handleClickOpen}>
                History
            </Button>
            <Dialog
                fullScreen
                open={open}
                onClose={handleClose}
                TransitionComponent={Transition}
            >
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
                            Lease History
                        </Typography>
                    </Toolbar>
                </AppBar>
                <div style={{ flexGrow: 1 }}>
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
            </Dialog>

        </div>
    );
}