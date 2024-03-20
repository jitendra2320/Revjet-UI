import React, { useEffect, useState } from "react";
import ChartsEmbedSDK from "@mongodb-js/charts-embed-dom";
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import { GetReports } from "../../REST/utilities";
import { useNavigate } from 'react-router-dom'
import Button from '@mui/material/Button'

export default function Reports() {

    const [baseUrl, setBaseUrl] = useState(null)
    const [chartId, setChartId] = useState(null)
    const [reportsList, setReportsList] = useState([])

    const [list, setList] = useState('');
    const navigate = useNavigate()

    // const reportsList = [
    //     { label: 'Aging Report', value: 1, baseUrl: "https://charts.mongodb.com/charts-project-0-afvbn", chartId: "8abcf83f-b1ac-42d3-a69d-1244ab5b3226" },
    //     {label:'Aging Report for Line Items',value:2, baseUrl:"https://charts.mongodb.com/charts-project-0-afvbn",chartId:"95d4801c-4870-486e-b70f-01ae12507eea"},
    //     {label:'Collection Report',value:3, baseUrl:"https://charts.mongodb.com/charts-project-0-afvbn",chartId:"59195eb7-711c-4149-9d0a-64d640cbcf24"},
    //     {label:'Billing Report',value:4,baseUrl:"https://charts.mongodb.com/charts-project-0-afvbn",chartId:"49f93cea-49ea-4810-ad7e-002b99de025f"}
    // ]


    const handleChange = (event) => {
        const item = reportsList.find(each => each._id === event.target.value)
        const { _id, baseUrl, chartId } = item
        setList(_id);
        setBaseUrl(baseUrl)
        setChartId(chartId)
    };

    useEffect(() => {
        (async () => {
            const resp = await GetReports()
            setReportsList(resp.data)
        })()
    }, [])



    useEffect(() => {
        (async () => {
            if (chartId) {
                const sdk = new ChartsEmbedSDK({
                    baseUrl: baseUrl
                });

                const chart = sdk.createChart({
                    chartId: chartId,
                    height: "700px"
                });
                await chart.render(document.getElementById("chart"));
            }
        })()
    }, [baseUrl, chartId])

    const handleLink = () => {
        navigate('/interactive', { replace: true })
    }

    return (<div className="row">
        <div className="col-3">
            <FormControl fullWidth>
                <InputLabel shrink id="demo-simple-select-label">Report Type</InputLabel>
                <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    value={list}
                    label="Report Type"
                    onChange={handleChange}
                >
                    {reportsList.map(each => {
                        return <MenuItem key={each._id} value={each._id}>{each.label}</MenuItem>
                    })}
                </Select>
            </FormControl>
        </div>
        <div className="col-12">
            <Button onClick={handleLink}>Interactive Reports</Button>
        </div>
        <div className="col-12">
            <div id='chart'>
            </div>
        </div>
    </div >
    )
}




