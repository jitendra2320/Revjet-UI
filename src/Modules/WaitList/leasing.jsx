import React, { useState, useEffect, Fragment } from 'react';
import { styled } from '@mui/material/styles';
import { Routes, Route, useLocation } from 'react-router-dom'
import IconButton from '@mui/material/IconButton';
import { GetPropertiesForGrid } from "../../REST/properties"
import FilterListIcon from '@mui/icons-material/Sort';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import PropertyCard from './card'
import { stringCompare, numberCompare, dateCompare } from '../../helpers/dates'
import PropertyItem from './propertyItem';
import { GetPropertyTypes } from '../../REST/properties';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import Tooltip from '@mui/material/Tooltip';


const FilterFlip = styled((props) => {
    const { flip, ...other } = props;
    return <IconButton {...other} />;
})(({ theme, flip }) => ({
    transform: !flip ? 'rotate(0deg)' : 'rotate(180deg)',
    marginLeft: 'auto',
    transition: theme.transitions.create('transform', {
        duration: theme.transitions.duration.shortest,
    }),
}));

export default function LeaseListing() {
    const [data, setData] = useState([])
    const [filterVal, setFilterVal] = useState('')
    const [filterDir, setFilterDir] = useState(false)
    const location = useLocation()
    const [prpTypes, setPrpTypes] = useState([])
    const [prpTypeVal, setPrpTypeVal] = useState('')
    const [dataCopy, setDataCopy] = useState([])

    useEffect(() => {
        (async () => {
            const types = await GetPropertyTypes()
            const values = await GetPropertiesForGrid()
            handleMapData(values.data)
            setPrpTypes(types.data)
            const data = values.data.map(each => {
                const typeofProp = types.data.find(e => e._id === each.propertyType)
                return { ...each, recentAvailability: each.dateAvailable, prpType: typeofProp ? typeofProp.name : '' }
            })
            setData(data)
            setDataCopy(data)
        })()
    }, [])

    const handleChange = (e) => {
        const { value } = e.target
        setFilterVal(value)
    }

    // const getDate = (dates = []) => {
    //     dates.sort((a, b) => {
    //         return moment(a).isAfter(b)
    //     })
    //     return dates[0]
    // }

    useEffect(() => {
        setData(x => {
            const value = filterVal
            const sortedData = [].concat(x).sort((a, b) => {
                // console.log('a,b', a[value], b[value])
                let ret = 0
                if (a[value] && b[value]) {
                    if (value === 'rent') ret = numberCompare(a[value], b[value])
                    if (value === 'recentAvailability') ret = dateCompare(a[value], b[value])
                    if (value === 'name') ret = stringCompare(a[value], b[value])
                    if (value === 'prpType') ret = stringCompare(a[value], b[value])
                    if (filterDir) {
                        if (ret) return 1
                        else return - 1
                    } else {
                        if (ret) return -1
                        else return 1
                    }
                } else return ret
            })
            return sortedData
        })

    }, [filterDir, filterVal])


    const handleFilterDir = () => setFilterDir(!filterDir)

    const handlePrpType = (e) => {
        const prpType = e.target.value
        setPrpTypeVal(prpType)
        const filteredData = dataCopy.filter(e => {
            return e.propertyType === prpType
        })
        handleMapData(filteredData)
        setData(filteredData)
    }

    const handleMapData = (data) => {
        sessionStorage.setItem('mapData', JSON.stringify(data))
    }

    return <Fragment>
        <Routes>
            <Route path=':id' element={<PropertyItem />} />
        </Routes>
        {location.pathname === '/listings' && (<div className="row h-100" style={{ overflow: 'hidden' }}>
            <div className='col-6'>
                <iframe src={process.env.PUBLIC_URL + '/grid.html'}
                    frameBorder="0"
                    marginHeight="0"
                    marginWidth="0"
                    width="100%"
                    height="100%"
                    title='Template Editor'
                    scrolling="auto" />
            </div>

            <div className='col-6 h-100 mt-2'>
                <div className="row h-100">
                    <div className='col-3'>
                        <FormControl fullWidth>
                            <InputLabel   id="demo-simple-select-label">Property Type</InputLabel>
                            <Select
                                labelId="demo-simple-select-label"
                                id="demo-simple-select"
                                value={prpTypeVal}
                                label="Sort"
                                onChange={handlePrpType}
                                inputProps={{
                                    name: 'select'
                                }}
                            >
                                {prpTypes.map((each) => {
                                    const { name, _id } = each
                                    return <MenuItem key={_id} value={_id}> {name} </MenuItem>
                                })}
                            </Select>
                        </FormControl>
                    </div>
                    <div className='col-3'>
                        <Tooltip title="Clear">
                            <IconButton onClick={() => { setData(dataCopy); setPrpTypeVal(''); handleMapData(dataCopy) }}>
                                <HighlightOffIcon />
                            </IconButton>
                        </Tooltip>
                    </div>
                    <div className='col-3'>
                        <FormControl fullWidth>
                            <InputLabel  id="demo-simple-select-label">Sort List</InputLabel>
                            <Select
                                labelId="demo-simple-select-label"
                                id="demo-simple-select"
                                value={filterVal}
                                label="Sort"
                                onChange={handleChange}
                                inputProps={{
                                    name: 'select'
                                }}
                            >
                                {[{ name: 'Rent', value: 'rent' }, { name: 'Name', value: 'name' }, { name: 'Availability', value: 'recentAvailability' }, { name: 'Property Type', value: 'prpType' }].map((each) => {
                                    const { name, value } = each
                                    return <MenuItem key={value} value={value}> {name} </MenuItem>
                                })}
                            </Select>
                        </FormControl>
                    </div>
                    <div className='col-3'>
                        <Tooltip title="Sort">
                            <FilterFlip flip={filterDir} onClick={handleFilterDir}>
                                <FilterListIcon />
                            </FilterFlip>
                        </Tooltip>
                    </div>
                    <div className='col-12' />
                    <div className='col-12' style={{ height: 'calc(100% - 50px)', overflow: 'auto' }}>
                        <div className='row'>
                            {data.map((each, idx) => {
                                return <PropertyCard data={each} key={idx} />
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div >)}
    </Fragment>
}