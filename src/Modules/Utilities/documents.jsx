import React, { Fragment, useState, useEffect } from 'react';
import { GetDocumentTypes, DeleteDocument, DownloadDocument, UploadDocument, GetDocumentList } from "../../REST/utilities";
import FormControl from '@mui/material/FormControl';
import NativeSelect from '@mui/material/NativeSelect';
import InputLabel from '@mui/material/InputLabel';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import FileIcon from '@mui/icons-material/FileCopy';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import Access from '../../Utils/authorize';
import { dateFormat } from '../../helpers/dates'
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import {blobToBase64,base64ToBlob} from "../../Utils/fileutil" 

function Documents({ docIds = [], onUpload, onDelete, module }) {
   
    const [documents,setDocuments ] = useState({data:[],types:[]})
    const [refresh, setRefresh] = useState(false)
    const {data,types} = documents;
    
    useEffect(() => {
        const allPromise = Promise.all([ GetDocumentTypes(), GetDocumentList(docIds)]);
        allPromise.then(values => {
             
             setDocuments({types: values[0]?.data ,data:values[1]?.data })
        }).catch(error => {
            console.log(error); 
            
        });
    }, [refresh])

    const toggleRefresh = () => setRefresh(r => !r)

    const handleFile = (evt) => {
        const files = evt.target.files;
        if (files && files.length > 0) {
            const file = files[0];
            const typeId = document.getElementById('typeSelect').value
            const formData = new FormData()
            formData.append('typeId', typeId)
            formData.append('file', file)
            formData.append('createdBy', Access.getFullname())
            UploadDocument(formData).then(resp => {
                onUpload(resp.data)
            })
        }
    }

    const handleDelete = (id) => DeleteDocument(id).then(toggleRefresh)

    const handleDownload = (id, filename) => {
        DownloadDocument(id).then(resp => {
            saveFile(resp.data, filename)
        })
    }

    const saveFile = (blob, filename) => {
        blobToBase64(blob) 
        .then((dataURI)=>{
            
            let newWindow = window.open('');
            newWindow.document.write(
            "<iframe width='100%' height='100%' src='" +dataURI + "'></iframe>" );
        })
       /* if (window.navigator.msSaveOrOpenBlob) {
            window.navigator.msSaveOrOpenBlob(blob, filename);
        } else {
            const a = document.createElement('a');
            document.body.appendChild(a);
            const url = window.URL.createObjectURL(blob);
            a.href = url;
            a.download = filename;
            a.click();
            setTimeout(() => {
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            }, 0)
        }
        */ 
    }

    return <Fragment>
        <FormControl fullWidth key='formcontrol'>
            <InputLabel shrink variant="standard" htmlFor="typeSelect" key='inputlabel'>
                Document Type
            </InputLabel>
            <NativeSelect margin='dense' inputProps={{ id: 'typeSelect' }} defaultValue={""} key='nativeselect'>
                {types.map((e, idx) => {
                    return <option key={idx} value={e._id}>{e.name}</option>
                })}
            </NativeSelect>
            <input type='file' accept='image/*,.pdf,.doc,.docx' onChange={handleFile} className='form-control' key='inputfile' />
        </FormControl>
        <Paper style={{maxHeight: 200, overflow: 'auto'}}>

        <List >
            <Divider />
            {data.map((value, idx) => {
                return (
                <Fragment key={idx}>
                     <ListItem 
                        secondaryAction={
                            Access.isAdmin(module) && <IconButton onClick={() => handleDelete(value._id, idx)} edge="end">
                                <DeleteIcon />
                            </IconButton>
                        }
                     >
                     <ListItemButton   onClick={() => handleDownload(value.awsId, value.name)} dense>
                        <ListItemText 
                            primary={
                 
                                <React.Fragment>
                                    <Typography variant="subtitle2" gutterBottom>
                                        {value.name}
                                    </Typography>
                                    <Typography variant="subtitle1" gutterBottom>
                                        {types.find((x)=>{ return x._id == value.typeId}).name }
                                    </Typography>
                                </React.Fragment>
                            } 
                            secondary={
                                <React.Fragment>    
                                    <Typography sx={{ display: 'inline' }}
                                    component="span"
                                    variant="caption"
                                    color="text.primary"
                                    >
                                        {value.createdBy}
                                    </Typography>
                                    <Typography variant="title" color="inherit" noWrap>
                                        &nbsp;|&nbsp;
                                    </Typography>
                                    <Typography sx={{ display: 'inline' }}
                                    component="span"
                                    variant="caption"
                                    color="text.primary"
                                    >
                                        {dateFormat(value.createdAt)}
                                    </Typography>
                                </React.Fragment>
                            }    
                            />
                    </ListItemButton>          
                    </ListItem>
                    <Divider />
                </Fragment>
                );
            })}
        </List>
        </Paper>
    </Fragment >       
}


export default function DocumentView({ docIds = [], onUpload, icon = false, fullWidth = false, module }) {
    const [open, setOpen] = React.useState(false);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    return (
        <Fragment>
            {!icon && <Button variant="outlined" startIcon={<FileCopyIcon />} onClick={handleClickOpen}>
                Documents
            </Button>}
            {icon && <IconButton onClick={handleClickOpen} edge="end">
                <FileIcon />
            </IconButton>}
            <Dialog open={open} onClose={handleClose} fullWidth={fullWidth}>
                <DialogTitle>Documents</DialogTitle>
                <DialogContent>
                    <Documents key={new Date().toISOString()} onUpload={onUpload} module={module} docIds={docIds} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Done</Button>
                </DialogActions>
            </Dialog>
        </Fragment>
    );
}