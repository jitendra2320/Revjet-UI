import React, { useEffect, useState } from 'react';
import {
    DataGrid, GridToolbarContainer,
    GridToolbarExport,
    gridClasses,
} from '@mui/x-data-grid';
import Dialog from '@mui/material/Dialog';
import CloseIcon from '@mui/icons-material/Close';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Slide from '@mui/material/Slide';
import { useParams, useNavigate } from 'react-router-dom'
import Button from '@mui/material/Button'
import { GetUnpaidItems } from '../../REST/company';
import { AddBalance, UpdateInvoiceItems } from '../../REST/company';
import Alert from '@mui/material/Alert';
import { getAmount } from '../../helpers/amount';
import { dateFormat } from '../../helpers/dates';
import PaymentIcon from '@mui/icons-material/Payment';


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

export default function Balances({ availAmount, onRefresh }) {
    const [open, setOpen] = useState(false);
    const { id } = useParams()
    const [rows, setRows] = useState([])
    const [data, setData] = useState({})
    const [selectedAmount, setSelectedAmount] = useState(0)
    const [page, setPage] = useState(10)
    const [alert, setAlert] = useState(false)
    const navigate = useNavigate()


    const [refresh, setRefresh] = useState(false)

    const toggleRefresh = () => setRefresh(refresh => !refresh)

    const amountParser = (params) => getAmount(params.value)
    const dateParser = (params) => dateFormat(params.value)

    useEffect(() => {
        toggleRefresh()
    }, [])

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const columns = [
        { field: 'id', headerName: 'ID', flex: 0.5, hide: true },
        {
            field: 'name',
            headerName: 'Name',
            flex: 0.5
        },
        {
            field: 'charges',
            headerName: 'Charges',
            flex: 0.5,
            renderCell: amountParser
        },
        {
            field: 'amount',
            headerName: 'Quantity',
            flex: 0.5,
        },
        {
            field: 'invoiceNumber',
            headerName: 'Invoice Number',
            flex: 0.5
        },
        {
            field: 'dueDate',
            headerName: 'Due Date',
            flex: 0.5,
            renderCell: dateParser
        }
    ];

    useEffect(() => {
        (async () => {
            const result = await GetUnpaidItems(id)
            let data = {}
            setRows(result.data.reduce((accum, invoice) => {
                const { lineItems, _id, invoiceNumber, dueDate } = invoice
                return accum.concat(lineItems.map(each => {
                    const val = { ...each, id: each._id, invoiceId: _id, invoiceNumber: invoiceNumber, dueDate }
                    data[each._id] = val
                    return val
                }))
            }, []))
            setData(data)
        })()

    }, [id, refresh])

    useEffect(() => {
        const clear = setTimeout(() => {
            setAlert(false)
        }, 2000)

        return function cleanup() {
            clearInterval(clear)
        };
    }, [alert])

    const handlePay = async () => {
        console.log(data)
        console.log(selectedAmount)
        let totalAmt = 0
        let invoiceNav = null // redirect to the invoice after successful payment
        if (selectedAmount) {
            const res = selectedAmount.reduce((accum, each) => {
                const { name, description, uid, charges, invoiceId, _id, amount } = data[each]
                invoiceNav = invoiceId
                totalAmt = totalAmt + (charges * amount)
                if (accum[invoiceId]) {
                    accum[invoiceId].push({ name, description, uid, _id, charges, amount, receiptId: 'PAID BY BALANCE' })
                }
                else accum[invoiceId] = [{ name, description, uid, _id, charges, amount, receiptId: 'PAID BY BALANCE' }]
                return accum
            }, {})
            console.log('total,res', totalAmt, res)
            if (availAmount > totalAmt) {
                await AddBalance({ accountNum: 'Paid with Balance', routingNum: 'Paid with Balance', amount: totalAmt, type: 'Debit', tenantId: id, dateApplied: (new Date()).toString() })
                console.log('res---------', res)
                await UpdateInvoiceItems(res)
                navigate('/invoices/' + invoiceNav)

                // toggleRefresh()
                // handleClose()
                // onRefresh()
            } else {
                setAlert(true)
            }
        }

    }

    console.log(rows)

    return (
        <div>
            <Button variant="outlined" onClick={handleClickOpen} endIcon={<PaymentIcon />}>
                Pay Invoices
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
                            Pay Invoices
                        </Typography>
                    </Toolbar>
                </AppBar>
                <div className='col-3'>
                    <Button variant="outlined" onClick={handleClickOpen}>
                        Balance: ${availAmount}
                    </Button>
                </div>
                <div style={{ height: 400, width: '100%' }}>
                    <DataGrid
                        rows={rows}
                        columns={columns}
                        pageSize={page}
                        rowsPerPageOptions={[5, 10, 15, 20]}
                        onPageSizeChange={e => setPage(e)}
                        checkboxSelection
                        disableSelectionOnClick
                        onSelectionModelChange={(selectionModel, details) => setSelectedAmount(selectionModel)}
                        components={{
                            Toolbar: CustomToolbar,
                        }}
                    />
                </div>
                <div className='col-3'>
                    <Button variant="outlined" onClick={() => handlePay()}>
                        Pay Now
                    </Button>
                    {alert && <Alert severity="warning">InSufficient Funds</Alert>}
                </div>
            </Dialog>
        </div>
    );
}