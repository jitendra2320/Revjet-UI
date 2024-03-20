import * as React from 'react';
 
import { Button, FormControl, InputLabel, MenuItem, Select } from '@mui/material';
 
import AddIcon from '@mui/icons-material/Add'
import {blobToBase64,base64ToBlob} from "../../../Utils/fileutil" 
import {
    DataGrid, GridToolbarContainer,
    GridToolbarExport,
    gridClasses,
} from '@mui/x-data-grid';
import BackIcon from '@mui/icons-material/ArrowBack';
import InspectionView from "./editinspectionview";

import { useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useEffect } from 'react';
import {DownloadFile, getMyInspection,getInspectionsById } from '../../../REST/inspections';
import moment from 'moment';



function CustomToolbar() {
    return (
        <GridToolbarContainer className={gridClasses.toolbarContainer}>

        </GridToolbarContainer>
    );
}

export default function InspectionList(props) {
    const navigate = useNavigate();
    const location = useLocation();
    
    const [view, setView] = React.useState(null);
    const [data,setData] = React.useState({ schema:null,rowList:null })
    const {schema,rowList} = data     
       
    const id = location.pathname.replace("/inspection/inspectionList/","")

    const renderColumnGenerate = (component)=>{
            if (component.type == "fileupload")
            return (params)=>{
                const value = params?.value
                const showFile = (evt)=>{
                     evt.stopPropagation()
                     evt.preventDefault()
                    DownloadFile(value)
                    .then((resp)=>{ return  blobToBase64(resp.data) })
                    .then((dataURI)=>{
                        
                        let newWindow = window.open('');
                        newWindow.document.write(
                        "<iframe width='100%' height='100%' src='" +dataURI + "'></iframe>" );
                    })
                    
                }
                if(!value) return (<span>No Data</span>)
                return (<span style={{cursor:'pointer',color:'blue'}} onClick={showFile} >Click to View</span>)
            }
            if(component.type == "datetime")
            {
                return (params)=>{
                    let value = params?.value
                    if(value)
                    {
                        try {
                            value =  new Date(value).toLocaleString()  
                        } catch (error) {
                            
                        }

                    } 
                    return (<span   > {value}</span>)
                }
            }
            if(component.type == "checklist")
            {
                return (params)=>{
                    let value = params?.value
                    if(value && value.length )
                    {
                        value = value.join(" , ")

                    } 
                    return (<span> {value}</span>)
                }
            }
            
            return (params)=>{
                let value = params?.value
                
                return (<span> {value}</span>)
            }
    }
     
    const getColumns = ()=>{
        let cols = []
        schema.components.forEach((x, index) =>
            {
                if(x?.type != 'button' && x?.type != 'text' && x?.type != 'image' 
                        && (typeof x.layout.showongrid == "undefined" ||  x.layout.showongrid != true) )
                {
                    let col = { field: "myData."+x?.key, headerName: x?.label, width:300, 
                    id: index, valueGetter: (params) => params?.row?.myData[x?.key]  }
                 
                    col.renderCell =  renderColumnGenerate(x)
                    
                    cols.push(col)
                } 
            })   
            
        let id = cols.length

        cols.push({ field: 'myData.createdDate', headerName: 'Created On', width:300 ,  
            id: id+1,
            valueGetter: (params) => moment(params?.row?.myData?.createdDate).format("MM/DD/yyyy HH:ss") });
        cols.push({ field: 'myData.createdBy', headerName: 'Created By', width:300 ,  
            id: id+2,valueGetter: (params) => params?.row?.myData?.createdBy }); 

        return cols;    
    }
    useEffect(() => {
		
        const allPromise = Promise.all([getInspectionsById(id), getMyInspection(id)]);
        allPromise.then(values => {
             setData ({schema:values[0]?.data?.formData?.schema,rowList:values[1]?.data})
            
        }).catch(error => {
            console.log(error); 
            navigate("/inspection")
        });
           
         
        			 
   }, []);
  
   
    return (
        <div style={{ height: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>

                <Button onClick={() => {
                    navigate("/inspection/editInspection/"+id);
                }} variant='outlined' endIcon={<AddIcon />}>Add New Inspection</Button>

                <div>
                      
                    <Button style={{ float: 'right' }} variant='outlined' onClick={() => navigate(-1)}
                         startIcon={<BackIcon />}>Back</Button>
                </div>
            </div>
           {
                rowList  &&
                <DataGrid
                    rows={rowList}
                    columns={getColumns()}
                    pageSize={10}
                    rowsPerPageOptions={[5, 10, 15, 20]}
                    disableRowSelectionOnClick 
                    onRowClick={(params) => setView(params.row.myData)}
                    components={{
                        Toolbar: CustomToolbar,
                    }}
                    getRowId={(i) => {
                        console.log('-----,', i)
                        return i?._id
                    }}
                />
            }

            {
                view != null && <InspectionView componenetgenerator={renderColumnGenerate} schema = {schema} data={view} handleClose={()=>{ setView(null)}}  />

            } 
        </div>
        
         
    );
}