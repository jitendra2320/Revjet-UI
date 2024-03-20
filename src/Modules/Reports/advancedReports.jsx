import React, { useState } from 'react';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';

import DatePicker from '@mui/lab/DatePicker';
import Button from '@mui/material/Button';

export default function AdvancedReports() {
    const [value, setValue] = useState({ start: new Date(), end: new Date() })
    // const [data, setData] = useState([])
    // const [chart, setChart] = useState('bar')
    // const [type, setType] = useState('time')

    const handleChange = type => (val) => {
     //   console.log('prev', prev)
        console.log('type', type)
        let prev = { ...value }
        prev[type] = val
        setValue(prev);
    };

    const handleClick = () => {
        // GetCharts({ ...value, type }).then(resp => {
        //     let temp = []
        //     for (var item in resp.data)
        //         temp.push({ name: item, count: resp.data[item] })
        //     console.log(JSON.stringify(temp))
        //     setData(temp)
        // })
    }

    // const [rows, setRows] = useState([])
    // const [open, setOpen] = useState(false)
    // const [page, setPage] = useState(10)

    // const amountParser = (params) => getAmount(params.value)

    // const columns = [
    //     { field: 'tenantId', headerName: 'Company Name', flex: 0.5 },
    //     { field: 'amountDue', headerName: 'Amount Due', flex: 0.5, renderCell: amountParser },
    //     { field: 'amountTotal', headerName: 'Amount Total', flex: 0.5, renderCell: amountParser },
    //     { field: 'amountPaid', headerName: 'Amount Paid', flex: 0.5, renderCell: amountParser },
    // ];

    return <div className='row'>
        <div className='col-12'>
            <div className='border py-2'>
                
                    <Stack spacing={3}>
                        <DatePicker
                            label="Start Date"
                            inputFormat="MM/dd/yyyy"
                            value={value.start}
                            onChange={handleChange('start')}
                            renderInput={(params) => <TextField {...params} />}
                        />
                        <DatePicker
                            label="End Date"
                            inputFormat="MM/dd/yyyy"
                            value={value.end}
                            onChange={handleChange('end')}
                            renderInput={(params) => <TextField {...params} />}
                        />
                        <Button onClick={handleClick}>View</Button>
                        <div style={{ height: 400 }}>

                        </div>
                        <div style={{ height: 400 }}>

                        </div>
                    </Stack>
                 
            </div>
        </div>
    </div>
}
