import React, { useState } from 'react';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
 
import { DatePicker } from '@mui/x-date-pickers';
import Button from '@mui/material/Button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { PieChart, Pie } from 'recharts';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import { GetCharts } from '../../REST/charts'
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

export default function ChartView() {
    return <div className='row'>
        <div className='col-12'>
            <ChartItem />
        </div>
    </div>
}

function ButtonGroup({ types = [], onChange, selected }) {

    const handleChange = (event, newValue) => {
        onChange(newValue)
    };

    return (
        <ToggleButtonGroup
            color="primary"
            value={selected}
            exclusive
            onChange={handleChange}
        >
            {types.map(e => {
                return <ToggleButton key={e.value} value={e.value}>{e.label}</ToggleButton>
            })}
        </ToggleButtonGroup>
    );
}


function ChartItem() {

    const [value, setValue] = useState({ start: new Date(), end: new Date() })
    //const [data, setData] = useState([{ "name": "0:00 - 1:00 Hrs", "count": 7 }, { "name": "1:00 - 2:00 Hrs", "count": 3 }, { "name": "2:00 - 3:00 Hrs", "count": 1 }, { "name": "3:00 - 4:00 Hrs", "count": 0 }, { "name": "4:00 - 5:00 Hrs", "count": 4 }, { "name": "5:00 - 6:00 Hrs", "count": 9 }, { "name": "6:00 - 7:00 Hrs", "count": 1 }, { "name": "7:00 - 8:00 Hrs", "count": 8 }, { "name": "8:00 - 9:00 Hrs", "count": 5 }, { "name": "9:00 - 10:00 Hrs", "count": 13 }, { "name": "10:00 - 11:00 Hrs", "count": 52 }, { "name": "11:00 - 12:00 Hrs", "count": 35 }, { "name": "12:00 - 13:00 Hrs", "count": 69 }, { "name": "13:00 - 14:00 Hrs", "count": 64 }, { "name": "14:00 - 15:00 Hrs", "count": 63 }, { "name": "15:00 - 16:00 Hrs", "count": 80 }, { "name": "16:00 - 17:00 Hrs", "count": 65 }, { "name": "17:00 - 18:00 Hrs", "count": 83 }, { "name": "18:00 - 19:00 Hrs", "count": 53 }, { "name": "19:00 - 20:00 Hrs", "count": 57 }, { "name": "20:00 - 21:00 Hrs", "count": 32 }, { "name": "21:00 - 22:00 Hrs", "count": 24 }, { "name": "22:00 - 23:00 Hrs", "count": 23 }, { "name": "23:00 - 24:00 Hrs", "count": 14 }])
    const [data, setData] = useState([])
    const [chart, setChart] = useState('bar')
    const [type, setType] = useState('time')

    const handleChange = type => (val) => {
        let prev = { ...value }
        prev[type] = val
        setValue(prev);
    };

    const handleClick = () => {
        GetCharts({ ...value, type }).then(resp => {
            let temp = []
            for (var item in resp.data)
                temp.push({ name: item, count: resp.data[item] })
            console.log(JSON.stringify(temp))
            setData(temp)
        })
    }

    const charts = [{ label: 'Bar', value: 'bar' }, { label: 'Pie', value: 'pie' }, { label: 'Radar', value: 'radar' }]
    const times = [{ label: 'Hourly', value: 'time' }, { label: 'Daily', value: 'daily' }, { label: 'Monthly', value: 'monthly' }]

    return <div className='border py-2'>
         
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
                <ButtonGroup types={charts} onChange={v => setChart(v)} selected={chart} />
                <ButtonGroup types={times} onChange={v => setType(v)} selected={type} />
                <Button onClick={handleClick}>View</Button>
                <div style={{ height: 400 }}>
                    {chart === 'bar' && <BarChartView data={data} />}
                    {chart === 'pie' && <PieChartView data={data} />}
                    {chart === 'radar' && <RadarChartView data={data} />}
                </div>
            </Stack>
        
    </div>
}


function BarChartView({ data }) {
    return <ResponsiveContainer width="100%" height="100%">
        <BarChart
            width={500}
            height={300}
            data={data}
            margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
            }}
        >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#8884d8" />
        </BarChart>
    </ResponsiveContainer>
}

function PieChartView({ data }) {
    return (
        <ResponsiveContainer width="100%" height="100%">
            <PieChart width={400} height={400}>
                <Pie data={data} dataKey="count" cx="50%" cy="50%" outerRadius={150} fill="#8884d8" />
                <Tooltip />
            </PieChart>
        </ResponsiveContainer>
    );
}

function RadarChartView({ data }) {
    return (
        <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                <PolarGrid />
                <PolarAngleAxis dataKey="name" />
                <PolarRadiusAxis />
                <Radar name="Total" dataKey="count" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                <Tooltip />
            </RadarChart>
        </ResponsiveContainer>
    );
}