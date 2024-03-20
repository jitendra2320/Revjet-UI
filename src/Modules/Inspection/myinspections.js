import React, { useState } from 'react'
import clsx from 'clsx';
import { makeStyles } from '@mui/styles';
import { useEffect } from 'react';
import { getInspectionBuilder } from '../../REST/inspections';
import { Box } from '@mui/material';
import {  useNavigate } from 'react-router-dom' 
 

function MyInspection(props) {
    const navigate = useNavigate()
    
    const [formsList, setFormsList] = useState([])
    const classes = useStyles()
  
     

    const getInspectionList = async () => {

             
		let resp = await getInspectionBuilder();
		 
		setFormsList(resp?.data)
        
	}
    useEffect(() => {
       
        getInspectionList();
		 
    },[])

    return (
        <div className='row px-3'>
            {formsList.map((e, i) => {
                return ( 
                <Box sx={{
                    ":hover": {
                        bgcolor: '#e9ecef'
                    }
                }} onClick={() => {
                    navigate(`inspectionList/${e?._id}`);
                  
                }} key={i}
                    className={clsx(classes.parent, 'text-center', 'col-sm-6', 'col-md-3', 'col-xs-12', 'mt-3')}
                    style={{ zIndex: 99, cursor: 'pointer' }}
                    id={'each-form'}
                >
                    <div className={clsx('p-3', 'bg-light', 'rounded')} >
                        <h5 className={clsx('p-3', 'text-dark')} >{e?.formData?.name}</h5>
                    </div>
                </Box>
                )
            })}
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
export default MyInspection;
