import React, { useState,Fragment } from 'react'
import Button from '@mui/material/Button'
import {
    GridToolbarContainer,
    gridClasses,
    DataGrid,
} from '@mui/x-data-grid';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { Box, FormControl, IconButton, InputLabel, List, ListItem, ListItemText, MenuItem, Select } from '@mui/material';
import BackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add'
import Access from '../../Utils/authorize';
import { FormTypes } from './configs/formTypes';
import { Edit, Refresh } from '@mui/icons-material';
import { makeStyles } from '@mui/styles';
import clsx from 'clsx';
import { useTheme } from '@mui/material/styles';
import { useEffect } from 'react';
import { getInspectionBuilder } from '../../REST/inspections';
import AuthProvider from '../Authentication/authProvider'
 

function CustomToolbar() {
    return (
        <GridToolbarContainer className={gridClasses.toolbarContainer}>

        </GridToolbarContainer>
    );
}

function Inspection() {
    const navigate = useNavigate()
	
    
    const [page, setPage] = useState(10)
    let [formsList, setFormsList] = useState([]);
     
	 

    const columns = [
        { field: 'formData.name', headerName: 'Form Name', flex: 0.5, valueGetter: (params) => params?.row?.formData?.name },
		{ field: 'formData.description', headerName: 'Description', flex: 0.5, valueGetter: (params) => params?.row?.formData?.description },
        
		{ field: 'formData.module', headerName: 'Module', flex: 0.5, valueGetter: (params) => params?.row?.formData?.module },
        {
            field: 'formData.scheduled', headerName: 'Is Scheduled', flex: 0.5, valueGetter: (params) => {

                if (params?.row?.formData?.scheduled) {
                    return "Yes";
                }

                else{
                    return "No";
                }
            }
        },
		{ field: 'formData.expression', headerName: 'Expression', flex: 0.5, valueGetter: (params) => params?.row?.formData?.expression },
        {
            field: 'name', headerName: 'Actions', flex: 0.5, renderCell: (params, index) => {
                console.log("parameter idd", params, params.api.getRowIndex(params?.id))
                return (
                    <>
                        <IconButton
                            onClick={() => {
                                navigate(`createInspection/${params?.id}` );
 
                            }}
                        >
                            <Edit />

                        </IconButton>
                        
                    </>

                )
            }
        },

    ];
	const getInspectionList = async () => {

             
		let resp = await getInspectionBuilder();
		 
		setFormsList(resp?.data)
        
	}
    useEffect(() => {

        getInspectionList();
		 
    },[])
	
	 
    return (
		 
		 <div style={{ display: 'flex', height: 'calc(100% - 50px)' }}>
			<div style={{ flexGrow: 1 }}>
				{Access.isInternal()  && <Button onClick={() => {
					navigate("createInspection");
				}} variant='outlined' endIcon={<AddIcon />}>Create New Form</Button>}
				<Button style={{ float: 'right' }} variant='outlined' onClick={() =>  navigate(-1) } startIcon={<BackIcon />}>Back</Button>
				
				<DataGrid
					rows={formsList}
					columns={columns}
					getRowId={(i) => {
						console.log('-----,', i)
						return i?._id
					}}
					pageSize={page}
					rowsPerPageOptions={[5, 10, 15, 20]}
					onPageSizeChange={e => setPage(e)}
					components={{
						Toolbar: CustomToolbar,
					}}
				/>
				 
			</div>
		</div>
			 
	)
}


const useStyles = makeStyles((theme) => ({
    paper: {
        padding: 20,
        marginTop: 10,
        marginBottom: 10,
        overflowY: "auto",
    },
    noDataHeight: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
    },
    formTitle: {
        fontWeight: "bold",
    },
}));

export default Inspection;