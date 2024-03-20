import React, { Fragment } from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import AuthProvider from '../Authentication/authProvider'
import PropertyListings, { AddListing, UpdateListing } from './listings'

export default function Properties() {
    const navigate = useNavigate()
    const location = useLocation()

    const handleLink = (link) => navigate(link)

    return <Fragment>
        {location.pathname === '/properties' && (
            <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
                <Divider />
                <ListItem>
                    <ListItemButton onClick={() => handleLink('/properties/types')} dense>
                        <ListItemText primary={`Property Types`} />
                    </ListItemButton>
                </ListItem>
                <Divider />
                <ListItem>
                    <ListItemButton onClick={() => handleLink('/properties/attributes')} dense>
                        <ListItemText primary={`Property Attributes`} />
                    </ListItemButton>
                </ListItem>
                <Divider />
                <ListItem>
                    <ListItemButton onClick={() => handleLink('/properties/areas')} dense>
                        <ListItemText primary={`Property Areas`} />
                    </ListItemButton>
                </ListItem>
                <Divider />
                <ListItem>
                    <ListItemButton onClick={() => handleLink('/properties/listings')} dense>
                        <ListItemText primary={`Property Listings`} />
                    </ListItemButton>
                </ListItem>
                <Divider />
            </List>
        )}
        <Routes>
            {/* <Route path='types' element={<AuthProvider><PropertyTypes /></AuthProvider>} /> */}
            {/* <Route path='attributes' element={<AuthProvider><PropertyAttributesCrud /></AuthProvider>} />
            <Route path='areas' element={<AuthProvider><PropertyAreasCrud /></AuthProvider>} /> */}
            <Route path='listings' element={<AuthProvider><PropertyListings /></AuthProvider>} />
            <Route path='listings/add' element={<AuthProvider><AddListing /></AuthProvider>} />
            <Route path='listings/:id' element={<AuthProvider><UpdateListing /></AuthProvider>} />
        </Routes>
    </Fragment>
}

// const PropertyTypesCrud = () => {

//     const [attrs, setAttrs] = useState([])

//     useEffect(() => {
//         (async () => {
//             const attributes = await GetPropertyAttrs()
//             setAttrs(attributes.data)
//         })()
//     }, [])

//     const schema = [
//         { type: 'string', required: true, headerName: 'Name', flex: 0.5, field: 'name', grid: true },
//         {
//             type: 'array', headerName: 'Attributes', flex: 0.5, field: 'attributes', grid: false,
//             options: attrs, multiselect: true, inputProps: { id: 'attrsSelect' }
//         },
//     ]

//     return <CrudView schema={schema} title='Property Types' type='PropertyType' pageSize={10} />

// }


// const PropertyAttributesCrud = () => {

//     const schema = [
//         { type: 'string', required: true, headerName: 'Name', flex: 1, field: 'name', grid: true },
//         { type: 'string', required: true, headerName: 'Description', flex: 1, field: 'description', grid: true },
//         { type: 'boolean', headerName: 'Allow Filtering', flex: 0.5, field: 'allowFiltering', grid: true },
//         { type: 'boolean', headerName: 'Allow Sorting', flex: 0.5, field: 'allowSorting', grid: true },
//     ]

//     return <CrudView schema={schema} title='Property Attribute' type='PropertyAttribute' pageSize={10} />

// }

// const PropertyAreasCrud = () => {

//     const schema = [
//         { type: 'string', required: true, headerName: 'Name', flex: 1, field: 'name', grid: true },
//         { type: 'string', required: true, headerName: 'Description', flex: 1, field: 'description', grid: true },
//     ]

//     return <CrudView schema={schema} title='Property Areas' type='PropertyArea' pageSize={10} />

// }