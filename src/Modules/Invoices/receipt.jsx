import React, { useState, useEffect } from 'react';
import Dialog from '@mui/material/Dialog';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Slide from '@mui/material/Slide';
import {
    DataGrid, GridToolbarContainer,
    GridToolbarExport,
    gridClasses,
} from '@mui/x-data-grid';
import { GetReceipts } from '../../REST/invoices';
import Typography from '@mui/material/Typography';
import moment from 'moment'

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

export default function ReceiptView({ open = false, handleClose, receiptIds = [] }) {

    const [rows, setRows] = useState([])
    const [page, setPage] = useState(10)

    const columns = [
        { field: 'id', headerName: 'Account Details', flex: 0.5, hide: true },
        { field: 'details', headerName: 'Account Details', flex: 0.5 },
        { field: 'name', headerName: 'Account Name', flex: 0.5 },
        { field: 'confirmationNum', headerName: 'Confirmation Number', flex: 0.5 },
        { field: 'paymentDate', headerName: 'Payment Date', flex: 0.5, renderCell: (params) => moment(params.value).format('MM/DD/YYYY') }
    ];

    useEffect(() => {
        (async () => {
            const ids = new Set(receiptIds.filter(e => e))
            const result = await GetReceipts(Array.from(ids))
            setRows(result.data.map(x => { return { ...x, id: x._id } }))
        })()
    }, [receiptIds])


    return (
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
                        Receipts
                    </Typography>
                </Toolbar>
            </AppBar>
            <div style={{ display: 'flex', height: '100%' }}>
                <div style={{ flexGrow: 1 }}>
                    <DataGrid
                        rows={rows}
                        columns={columns}
                        pageSize={page}
                        rowsPerPageOptions={[5, 10, 15, 20]}
                        onPageSizeChange={e => setPage(e)}
                        components={{
                            Toolbar: CustomToolbar,
                        }}
                    />
                </div>
            </div>
        </Dialog>
    );
}
