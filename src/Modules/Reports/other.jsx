import React, { Fragment, useEffect, useState } from 'react';
import { GetInsurances, GetInvoices } from '../../REST/report'
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import moment from 'moment'
import {
    DataGrid, GridToolbarContainer,
    GridToolbarExport, gridClasses
} from '@mui/x-data-grid';
import Button from '@mui/material/Button';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import { gridDateFormat } from '../../helpers/dates';
import { useNavigate } from 'react-router-dom'

function CustomToolbar() {
    return (
        <GridToolbarContainer className={gridClasses.toolbarContainer}>
            <GridToolbarExport />
        </GridToolbarContainer>
    );
}

export default function OtherReports() {
    const [type, setType] = React.useState('');

    const types = [
        'Monthly Billing Report', 'Quarterly Billing Report', 'Yearly Billing Report', 'Monthly Collection Report', 'Quarterly Collection Report',
        'Yearly Collection Report', 'Aging Report', 'Expired Insurance Report', 'Expiring Soon Insurance Report'
    ]

    const handleChange = (event) => {
        setType(event.target.value);
    };

    return <div className='row'>
        <div className='col-3'>
            <CustomSelect onChange={handleChange} label='Select Report Type' options={types} selected={type} />
        </div>
        <hr />
        <div className='col-12'>
            {type === 'Monthly Billing Report' && <MonthlyBilling />}
            {type === 'Quarterly Billing Report' && <QuarterlyBilling />}
            {type === 'Yearly Billing Report' && <YearlyBilling />}
            {type === 'Monthly Collection Report' && <MonthlyCollection />}
            {type === 'Yearly Collection Report' && <YearlyCollection />}
            {type === 'Quarterly Collection Report' && <QuarterlyCollection />}
            {type === 'Expired Insurance Report' && <ExpiredInsuranceReport type={'Expired'} />}
            {type === 'Expiring Soon Insurance Report' && <ExpiredInsuranceReport type={'Expiring Soon'} />}
            {/* {type === 'Aging Report' && <AgingReport />} */}
        </div>
    </div>

}

const CustomSelect = ({ label, onChange, options, selected }) => {
    return <FormControl className='py-2' fullWidth>
        <InputLabel shrink >{label}</InputLabel>
        <Select
            value={selected}
            placeholder="Select Report Type"
            label="Report Type"
            onChange={onChange}
        >
            {options.map(x => {
                return <MenuItem key={x} value={x}>{x}</MenuItem>
            })}
        </Select>
    </FormControl>
}


const MonthlyBilling = () => {

    const [year, setYear] = useState(2022)
    const [month, setMonth] = useState('January')
    const [data, setData] = useState([])
    const [invoices, setInvoices] = useState([])
    const [select, setSelect] = useState(null)


    useEffect(() => {
        const date = new Date(Date.parse('01 ' + month + ' ' + year))
        const begin = moment(date).clone().startOf('month').format('MM-DD-YYYY');
        const end = moment(date).clone().endOf('month').format('MM-DD-YYYY');
        GetInvoices({ begin, end }).then(resp => {
            if (Array.isArray(resp.data)) {
                let map = new Map();
                resp.data.forEach(x => {
                    map.set(x.companyId, map.has(x.companyId) ? map.get(x.companyId).concat(x) : [x])
                })
                let result = Array.from(map.values()).map(x => x.reduce((acc, curr) => {
                    acc.id = curr.companyId
                    acc.company = curr.company
                    acc.created += curr.created
                    acc.overDue += curr.overDue
                    acc.paid += curr.paid
                    acc.amountDue += curr.amountDue
                    acc.amountPaid += curr.amountPaid
                    acc.total += (acc.amountDue + acc.amountPaid)
                    return acc
                }, { id: '', company: '', amountDue: 0, amountPaid: 0, total: 0, created: 0, overDue: 0, paid: 0 }))
                setData(result)
                setInvoices(resp.data)
                setSelect(null)
            }
        }).catch(console.log)
    }, [year, month])

    const years = [2019, 2020, 2021, 2022, 2023]
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    const columns = [
        { field: 'id', headerName: 'id', flex: 0, hide: true },
        { field: 'company', headerName: 'Company Name', flex: 1 },
        { field: 'created', headerName: 'Created', flex: 1, valueFormatter: moneyFormat },
        { field: 'overDue', headerName: 'Overdue', flex: 1, valueFormatter: moneyFormat },
        { field: 'paid', headerName: 'Paid', flex: 1, valueFormatter: moneyFormat },
        { field: 'total', headerName: 'Total Billed', flex: 1, valueFormatter: moneyFormat }
    ]

    const handleYear = (event) => setYear(event.target.value);

    const handleMonth = (event) => setMonth(event.target.value);

    const onClick = (data) => {
        //setSelect({ ...data.row, status: data.field })
        setSelect({ ...data.row, status: 'company' })
    }

    return <div className='row'>
        <div className='col-3'><CustomSelect selected={year} label='Select Year' onChange={handleYear} options={years} /></div>
        <div className='col-3'><CustomSelect selected={month} label='Select Month' onChange={handleMonth} options={months} /></div>
        <div className='col-12' style={{ height: '600px' }}>
            {select === null && <TableView columns={columns} rows={data} handleClick={onClick} />}
            {select && <div className='row'>
                <div className='col-12'>
                    <Button variant='outlined' onClick={() => setSelect(null)}>{`< Back`}</Button>
                </div>
                <div className='col-12' style={{ height: '600px' }}>
                    <DetailView invoices={invoices} item={select} />
                </div>
            </div>}
        </div>
    </div>
}

const DetailView = ({ invoices, item }) => {

    const [rows, setRows] = useState([]);

    const columns = [
        { field: 'id', headerName: 'id', flex: 0, hide: true },
        { field: 'name', headerName: 'Invoice Name', flex: 1, },
        { field: 'description', headerName: 'Invoice Description', flex: 1 },
        { field: 'amountDue', headerName: 'Amount Due', flex: 1, valueFormatter: moneyFormat },
        { field: 'amountPaid', headerName: 'Amount Paid', flex: 1, valueFormatter: moneyFormat },
        { field: 'total', headerName: 'Total Billed', flex: 1, valueFormatter: moneyFormat }
    ]

    console.log('invoices', invoices)
    console.log('item', item)
    console.log('rows', rows)

    useEffect(() => {
        if (item.status === 'company' || item.status === 'total') {
            setRows(invoices.filter(x => x.companyId === item.id).map(x => { return { ...x, id: x.companyId, total: x.amountDue + x.amountPaid } }))
        }
        if (item.status === 'created') {
            setRows(invoices.filter(x => x.status === "Created" && x.companyId === item.id).map(x => { return { ...x, id: x.companyId, total: x.amountDue + x.amountPaid } }))
        }
        if (item.status === 'overDue') {
            setRows(invoices.filter(x => x.status === "Overdue" && x.companyId === item.id).map(x => { return { ...x, id: x.companyId, total: x.amountDue + x.amountPaid } }))
        }
        if (item.status === 'paid') {
            setRows(invoices.filter(x => x.status === "Paid" && x.companyId === item.id).map(x => { return { ...x, id: x.companyId, total: x.amountDue + x.amountPaid } }))
        }
    }, [item])

    return <TableView columns={columns} rows={rows} />

}

const TableView = ({ columns, rows, handleClick = null }) => {

    return <div style={{ height: '100%', width: '100%' }}>
        <DataGrid
            rows={rows}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[10, 25, 50]}
            onCellClick={handleClick}
            components={{
                Toolbar: CustomToolbar,
            }}
        />
    </div>
}

const moneyFormat = ({ value }) => {
    return '$' + value.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
}

const QuarterlyBilling = () => {

    const [data, setData] = useState([])
    const [invoices, setInvoices] = useState([])
    const [select, setSelect] = useState(null)
    const [value, setValue] = React.useState(1);

    // Oct-Dec = 1
    // Jan-Mar = 2
    // Apr-Jun = 3
    // Jul-Sep = 4
    const getQuarter = (v) => {
        const d = new Date();
        let m = Math.floor(d.getMonth() / 3) + 2;
        m -= m > 4 ? 4 : 0;
        let y = d.getFullYear() + (m == 1 ? 1 : 0);
        if (v == 1)
            return [y, m];
        if (v == 2) {
            m = m - 1
            if (m == 0) m = 4
            if (m == 1) y = y - 1
            return [y, m]
        }

    }

    const getDates = (y, m) => {
        if (m == 1) {
            return ['10-01-' + y, '12-31-' + y]
        }
        if (m == 2) {
            return ['01-01-' + y, '03-31-' + y]
        }
        if (m == 3) {
            return ['04-01-' + y, '06-30-' + y]
        }
        if (m == 4) {
            return ['07-01-' + y, '09-30-' + y]
        }
    }

    useEffect(() => {
        const [year, month] = getQuarter(value)
        const [begin, end] = getDates(year, month)
        GetInvoices({ begin, end }).then(resp => {
            if (Array.isArray(resp.data)) {
                let map = new Map();
                resp.data.forEach(x => {
                    map.set(x.companyId, map.has(x.companyId) ? map.get(x.companyId).concat(x) : [x])
                })
                let result = Array.from(map.values()).map(x => x.reduce((acc, curr) => {
                    acc.id = curr.companyId
                    acc.company = curr.company
                    acc.created += curr.created
                    acc.overDue += curr.overDue
                    acc.paid += curr.paid
                    acc.amountDue += curr.amountDue
                    acc.amountPaid += curr.amountPaid
                    acc.total += (acc.amountDue + acc.amountPaid) //(acc.amountDue + acc.amountPaid)
                    return acc
                }, { id: '', company: '', amountDue: 0, amountPaid: 0, total: 0, created: 0, overDue: 0, paid: 0 }))
                setData(result)
                setInvoices(resp.data)
                setSelect(null)
            }
        }).catch(console.log)
    }, [value])

    const columns = [
        { field: 'id', headerName: 'id', flex: 0, hide: true },
        { field: 'company', headerName: 'Company Name', flex: 1 },
        { field: 'created', headerName: 'Created', flex: 1, valueFormatter: moneyFormat },
        { field: 'overDue', headerName: 'Overdue', flex: 1, valueFormatter: moneyFormat },
        { field: 'paid', headerName: 'Paid', flex: 1, valueFormatter: moneyFormat },
        { field: 'total', headerName: 'Total Billed', flex: 1, valueFormatter: moneyFormat }
    ]


    const handleChange = (event) => {
        setValue(event.target.value);
    };

    const onClick = (data) => {
        setSelect({ ...data.row, status: 'company' })
    }

    return <div className='row'>
        <RadioGroup
            aria-labelledby="demo-controlled-radio-buttons-group"
            name="controlled-radio-buttons-group"
            row
            value={value}
            onChange={handleChange}
        >
            <FormControlLabel value={1} control={<Radio />} label="Current Quarter" />
            <FormControlLabel value={2} control={<Radio />} label="Previous Quarter" />
        </RadioGroup>
        <div className='col-12' style={{ height: '600px' }}>
            {select === null && <TableView columns={columns} rows={data} handleClick={onClick} />}
            {select && <div className='row'>
                <div className='col-12'>
                    <Button variant='outlined' onClick={() => setSelect(null)}>{`< Back`}</Button>
                </div>
                <div className='col-12' style={{ height: '600px' }}>
                    <DetailView invoices={invoices} item={select} />
                </div>
            </div>}
        </div>
    </div>
}

const YearlyBilling = () => {

    const [data, setData] = useState([])
    const [invoices, setInvoices] = useState([])
    const [select, setSelect] = useState(null)
    const [value, setValue] = React.useState(1);


    const getDates = (v) => {
        const d = new Date()
        const year = d.getFullYear()
        if (v == 1) {
            return ['01-01-' + year, '12-31-' + year]
        } else {
            return ['01-01-' + (year - 1), '12-31-' + (year - 1)]
        }
    }

    useEffect(() => {
        const [begin, end] = getDates(value)
        GetInvoices({ begin, end }).then(resp => {
            if (Array.isArray(resp.data)) {
                let map = new Map();
                resp.data.forEach(x => {
                    map.set(x.companyId, map.has(x.companyId) ? map.get(x.companyId).concat(x) : [x])
                })
                let result = Array.from(map.values()).map(x => x.reduce((acc, curr) => {
                    acc.id = curr.companyId
                    acc.company = curr.company
                    acc.created += curr.created
                    acc.overDue += curr.overDue
                    acc.paid += curr.paid
                    acc.amountDue += curr.amountDue
                    acc.amountPaid += curr.amountPaid
                    acc.total += (acc.amountDue + acc.amountPaid)
                    return acc
                }, { id: '', company: '', amountDue: 0, amountPaid: 0, total: 0, created: 0, overDue: 0, paid: 0 }))
                setData(result)
                setInvoices(resp.data)
                setSelect(null)
            }
        }).catch(console.log)
    }, [value])

    const columns = [
        { field: 'id', headerName: 'id', flex: 0, hide: true },
        { field: 'company', headerName: 'Company Name', flex: 1 },
        { field: 'created', headerName: 'Created', flex: 1, valueFormatter: moneyFormat },
        { field: 'overDue', headerName: 'Overdue', flex: 1, valueFormatter: moneyFormat },
        { field: 'paid', headerName: 'Paid', flex: 1, valueFormatter: moneyFormat },
        { field: 'total', headerName: 'Total Billed', flex: 1, valueFormatter: moneyFormat }
    ]


    const handleChange = (event) => {
        setValue(event.target.value);
    };

    const onClick = (data) => {
        setSelect({ ...data.row, status: 'company' })
    }

    return <div className='row'>
        <RadioGroup
            aria-labelledby="demo-controlled-radio-buttons-group"
            name="controlled-radio-buttons-group"
            row
            value={value}
            onChange={handleChange}
        >
            <FormControlLabel value={1} control={<Radio />} label="Current Year" />
            <FormControlLabel value={2} control={<Radio />} label="Previous Year" />
        </RadioGroup>
        <div className='col-12' style={{ height: '600px' }}>
            {select === null && <TableView columns={columns} rows={data} handleClick={onClick} />}
            {select && <div className='row'>
                <div className='col-12'>
                    <Button variant='outlined' onClick={() => setSelect(null)}>{`< Back`}</Button>
                </div>
                <div className='col-12' style={{ height: '600px' }}>
                    <DetailView invoices={invoices} item={select} />
                </div>
            </div>}
        </div>
    </div>
}

const MonthlyCollection = () => {

    const [year, setYear] = useState(2022)
    const [month, setMonth] = useState('January')
    const [data, setData] = useState([])
    const [invoices, setInvoices] = useState([])
    const [select, setSelect] = useState(null)


    useEffect(() => {
        const date = new Date(Date.parse('01 ' + month + ' ' + year))
        const begin = moment(date).clone().startOf('month').format('MM-DD-YYYY');
        const end = moment(date).clone().endOf('month').format('MM-DD-YYYY');
        GetInvoices({ begin, end }).then(resp => {
            if (Array.isArray(resp.data)) {
                let map = new Map();
                resp.data.forEach(x => {
                    map.set(x.companyId, map.has(x.companyId) ? map.get(x.companyId).concat(x) : [x])
                })
                let result = Array.from(map.values()).map(x => x.reduce((acc, curr) => {
                    acc.id = curr.companyId
                    acc.company = curr.company
                    acc.created += curr.created
                    acc.overDue += curr.overDue
                    acc.paid += curr.paid
                    acc.amountDue += curr.amountDue
                    acc.amountPaid += curr.amountPaid
                    acc.total += (acc.amountDue + acc.amountPaid)
                    return acc
                }, { id: '', company: '', amountDue: 0, amountPaid: 0, total: 0, created: 0, overDue: 0, paid: 0 }))
                setData(result)
                setInvoices(resp.data)
                setSelect(null)
            }
        }).catch(console.log)
    }, [year, month])

    const years = [2019, 2020, 2021, 2022, 2023]
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    const columns = [
        { field: 'id', headerName: 'id', flex: 0, hide: true },
        { field: 'company', headerName: 'Company Name', flex: 1 },
        { field: 'paid', headerName: 'Paid', flex: 1, valueFormatter: moneyFormat },
    ]

    const handleYear = (event) => setYear(event.target.value);

    const handleMonth = (event) => setMonth(event.target.value);

    const onClick = (data) => {
        //setSelect({ ...data.row, status: data.field })
        setSelect({ ...data.row, status: 'company' })
    }

    return <div className='row'>
        <div className='col-3'><CustomSelect selected={year} label='Select Year' onChange={handleYear} options={years} /></div>
        <div className='col-3'><CustomSelect selected={month} label='Select Month' onChange={handleMonth} options={months} /></div>
        <div className='col-12' style={{ height: '600px' }}>
            {select === null && <TableView columns={columns} rows={data} handleClick={onClick} />}
            {select && <div className='row'>
                <div className='col-12'>
                    <Button variant='outlined' onClick={() => setSelect(null)}>{`< Back`}</Button>
                </div>
                <div className='col-12' style={{ height: '600px' }}>
                    <DetailView invoices={invoices} item={select} />
                </div>
            </div>}
        </div>
    </div>
}

const QuarterlyCollection = () => {

    const [data, setData] = useState([])
    const [invoices, setInvoices] = useState([])
    const [select, setSelect] = useState(null)
    const [value, setValue] = React.useState(1);

    // Oct-Dec = 1
    // Jan-Mar = 2
    // Apr-Jun = 3
    // Jul-Sep = 4
    const getQuarter = (v) => {
        const d = new Date();
        let m = Math.floor(d.getMonth() / 3) + 2;
        m -= m > 4 ? 4 : 0;
        let y = d.getFullYear() + (m == 1 ? 1 : 0);
        if (v == 1)
            return [y, m];
        if (v == 2) {
            m = m - 1
            if (m == 0) m = 4
            if (m == 1) y = y - 1
            return [y, m]
        }

    }

    const getDates = (y, m) => {
        if (m == 1) {
            return ['10-01-' + y, '12-31-' + y]
        }
        if (m == 2) {
            return ['01-01-' + y, '03-31-' + y]
        }
        if (m == 3) {
            return ['04-01-' + y, '06-30-' + y]
        }
        if (m == 4) {
            return ['07-01-' + y, '09-30-' + y]
        }
    }

    useEffect(() => {
        const [year, month] = getQuarter(value)
        const [begin, end] = getDates(year, month)
        GetInvoices({ begin, end }).then(resp => {
            if (Array.isArray(resp.data)) {
                let map = new Map();
                resp.data.forEach(x => {
                    map.set(x.companyId, map.has(x.companyId) ? map.get(x.companyId).concat(x) : [x])
                })
                let result = Array.from(map.values()).map(x => x.reduce((acc, curr) => {
                    acc.id = curr.companyId
                    acc.company = curr.company
                    acc.created += curr.created
                    acc.overDue += curr.overDue
                    acc.paid += curr.paid
                    acc.amountDue += curr.amountDue
                    acc.amountPaid += curr.amountPaid
                    acc.total += (acc.amountDue + acc.amountPaid)
                    return acc
                }, { id: '', company: '', amountDue: 0, amountPaid: 0, total: 0, created: 0, overDue: 0, paid: 0 }))
                setData(result)
                setInvoices(resp.data)
                setSelect(null)
            }
        }).catch(console.log)
    }, [value])

    const columns = [
        { field: 'id', headerName: 'id', flex: 0, hide: true },
        { field: 'company', headerName: 'Company Name', flex: 1 },
        { field: 'paid', headerName: 'Paid', flex: 1, valueFormatter: moneyFormat },
    ]


    const handleChange = (event) => {
        setValue(event.target.value);
    };

    const onClick = (data) => {
        setSelect({ ...data.row, status: 'paid' })
    }

    return <div className='row'>
        <RadioGroup
            aria-labelledby="demo-controlled-radio-buttons-group"
            name="controlled-radio-buttons-group"
            row
            value={value}
            onChange={handleChange}
        >
            <FormControlLabel value={1} control={<Radio />} label="Current Quarter" />
            <FormControlLabel value={2} control={<Radio />} label="Previous Quarter" />
        </RadioGroup>
        <div className='col-12' style={{ height: '600px' }}>
            {select === null && <TableView columns={columns} rows={data} handleClick={onClick} />}
            {select && <div className='row'>
                <div className='col-12'>
                    <Button variant='outlined' onClick={() => setSelect(null)}>{`< Back`}</Button>
                </div>
                <div className='col-12' style={{ height: '600px' }}>
                    <DetailView invoices={invoices} item={select} />
                </div>
            </div>}
        </div>
    </div>
}

const YearlyCollection = () => {

    const [data, setData] = useState([])
    const [invoices, setInvoices] = useState([])
    const [select, setSelect] = useState(null)
    const [value, setValue] = React.useState(1);


    const getDates = (v) => {
        const d = new Date()
        const year = d.getFullYear()
        if (v == 1) {
            return ['01-01-' + year, '12-31-' + year]
        } else {
            return ['01-01-' + (year - 1), '12-31-' + (year - 1)]
        }
    }

    useEffect(() => {
        const [begin, end] = getDates(value)
        GetInvoices({ begin, end }).then(resp => {
            if (Array.isArray(resp.data)) {
                let map = new Map();
                resp.data.forEach(x => {
                    map.set(x.companyId, map.has(x.companyId) ? map.get(x.companyId).concat(x) : [x])
                })
                let result = Array.from(map.values()).map(x => x.reduce((acc, curr) => {
                    acc.id = curr.companyId
                    acc.company = curr.company
                    acc.created += curr.created
                    acc.overDue += curr.overDue
                    acc.paid += curr.paid
                    acc.amountDue += curr.amountDue
                    acc.amountPaid += curr.amountPaid
                    acc.total += (acc.amountDue + acc.amountPaid)
                    return acc
                }, { id: '', company: '', amountDue: 0, amountPaid: 0, total: 0, created: 0, overDue: 0, paid: 0 }))
                setData(result)
                setInvoices(resp.data)
                setSelect(null)
            }
        }).catch(console.log)
    }, [value])

    const columns = [
        { field: 'id', headerName: 'id', flex: 0, hide: true },
        { field: 'company', headerName: 'Company Name', flex: 1 },
        { field: 'paid', headerName: 'Paid', flex: 1, valueFormatter: moneyFormat },
    ]


    const handleChange = (event) => {
        setValue(event.target.value);
    };

    const onClick = (data) => {
        setSelect({ ...data.row, status: 'paid' })
    }

    return <div className='row'>
        <RadioGroup
            aria-labelledby="demo-controlled-radio-buttons-group"
            name="controlled-radio-buttons-group"
            row
            value={value}
            onChange={handleChange}
        >
            <FormControlLabel value={1} control={<Radio />} label="Current Year" />
            <FormControlLabel value={2} control={<Radio />} label="Previous Year" />
        </RadioGroup>
        <div className='col-12' style={{ height: '600px' }}>
            {select === null && <TableView columns={columns} rows={data} handleClick={onClick} />}
            {select && <div className='row'>
                <div className='col-12'>
                    <Button variant='outlined' onClick={() => setSelect(null)}>{`< Back`}</Button>
                </div>
                <div className='col-12' style={{ height: '600px' }}>
                    <DetailView invoices={invoices} item={select} />
                </div>
            </div>}
        </div>
    </div>
}

const ExpiredInsuranceReport = (type) => {

    const [data, setData] = useState([])
    const navigate = useNavigate()

    useEffect(() => {
        GetInsurances(type.type).then(resp => {
            setData(resp.data)
        })
    }, [])



    const columns = [
        { field: 'id', headerName: 'id', flex: 0, hide: true },
        { field: 'companyName', headerName: 'Company Name', flex: 1 },
        { field: 'type', headerName: 'Insurance Type', flex: 1 },
        { field: 'startDate', headerName: 'Start Date', flex: 1, valueFormatter: gridDateFormat },
        { field: 'endDate', headerName: 'End Date', flex: 1, valueFormatter: gridDateFormat },
        { field: 'createdAt', headerName: 'Created Date', flex: 1, valueFormatter: gridDateFormat },
    ]


    const handleClick = (e) => {
        navigate('/companies/' + e.row.company)
    }

    return <div className='row' style={{ height: '600px' }}>
        <div style={{ height: '100%', width: '100%' }}>
            <DataGrid
                rows={data}
                columns={columns}
                pageSize={10}
                rowsPerPageOptions={[10, 25, 50]}
                onCellClick={handleClick}
                components={{
                    Toolbar: CustomToolbar,
                }}
            />
        </div>
    </div>
}

const AgingReport = () => {
    const [year, setYear] = useState(2022)
    const [month, setMonth] = useState('January')
    const [data, setData] = useState([])
    const [invoices, setInvoices] = useState([])
    const [select, setSelect] = useState(null)


    useEffect(() => {
        const date = new Date(Date.parse('01 ' + month + ' ' + year))
        const begin = moment(date).clone().startOf('month').format('MM-DD-YYYY');
        const end = moment(date).clone().endOf('month').format('MM-DD-YYYY');
        GetInvoices({ begin, end }).then(resp => {
            if (Array.isArray(resp.data)) {
                let map = new Map();
                resp.data.forEach(x => {
                    map.set(x.companyId, map.has(x.companyId) ? map.get(x.companyId).concat(x) : [x])
                })
                let result = Array.from(map.values()).map(x => x.reduce((acc, curr) => {
                    acc.id = curr.companyId
                    acc.company = curr.company
                    acc.created += curr.created
                    acc.overDue += curr.overDue
                    acc.paid += curr.paid
                    acc.amountDue += curr.amountDue
                    acc.amountPaid += curr.amountPaid
                    acc.total += (acc.amountDue + acc.amountPaid)
                    return acc
                }, { id: '', company: '', amountDue: 0, amountPaid: 0, total: 0, created: 0, overDue: 0, paid: 0 }))
                setData(result)
                setInvoices(resp.data)
                setSelect(null)
            }
        }).catch(console.log)
    }, [year, month])

    const years = [2019, 2020, 2021, 2022, 2023]
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    const columns = [
        { field: 'id', headerName: 'id', flex: 0, hide: true },
        { field: 'company', headerName: 'Company Name', flex: 1 },
        { field: 'created', headerName: 'Created', flex: 1, valueFormatter: moneyFormat },
        { field: 'overDue', headerName: 'Overdue', flex: 1, valueFormatter: moneyFormat },
        { field: 'paid', headerName: 'Paid', flex: 1, valueFormatter: moneyFormat },
        { field: 'total', headerName: 'Total Billed', flex: 1, valueFormatter: moneyFormat }
    ]

    const handleYear = (event) => setYear(event.target.value);

    const handleMonth = (event) => setMonth(event.target.value);

    const onClick = (data) => {
        //setSelect({ ...data.row, status: data.field })
        setSelect({ ...data.row, status: 'company' })
    }

    return <div className='row'>
        <div className='col-3'><CustomSelect selected={year} label='Select Year' onChange={handleYear} options={years} /></div>
        <div className='col-3'><CustomSelect selected={month} label='Select Month' onChange={handleMonth} options={months} /></div>
        <div className='col-12' style={{ height: '600px' }}>
            {select === null && <TableView columns={columns} rows={data} handleClick={onClick} />}
            {select && <div className='row'>
                <div className='col-12'>
                    <Button variant='outlined' onClick={() => setSelect(null)}>{`< Back`}</Button>
                </div>
                <div className='col-12' style={{ height: '600px' }}>
                    <DetailView invoices={invoices} item={select} />
                </div>
            </div>}
        </div>
    </div>
}

