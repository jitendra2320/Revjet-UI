import React from 'react';
import AppBar from '@mui/material/AppBar';
import CssBaseline from '@mui/material/CssBaseline';
import GlobalStyles from '@mui/material/GlobalStyles';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { blue } from '@mui/material/colors';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import InputBase from '@mui/material/InputBase';
import SendIcon from '@mui/icons-material/Send';
import AttachmentIcon from '@mui/icons-material/AttachFile';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import Slide from '@mui/material/Slide';
import { GetMessages, AddMessage, UploadDocument, DownloadDocumentById } from '../../REST/utilities'
import { useEffect } from 'react';
import { useState } from 'react';
import moment from 'moment';
import { useParams } from 'react-router-dom';
import { Button } from '@mui/material';

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

export default function MessageDialog({ open = false, id = null, handleClose }) {

    return (
        <Dialog fullWidth maxWidth='sm' open={open} TransitionComponent={Transition} onClose={handleClose}>
            <DialogContent>
                <MessageView id={id} />
            </DialogContent>
        </Dialog>
    );
}


function MessageView({ id }) {
    const [refresh, setRefresh] = useState(false)
    const [list, setList] = useState([])

    useEffect(() => {
        const getData = ()=>{
            if (id != null) {
               GetMessages(id)
               .then((data)=>{
                setList(data.data)
                // Scroll to Bottom of Page
                var objDiv = document.getElementsByClassName("chat-template")[0];
                objDiv.scrollTop = objDiv.scrollHeight;
               }) 
            }
        }
        getData()
        const timer = setInterval(getData,5000)   

        return ()=>{  clearInterval(timer) }

    }, [id, refresh])

    return (
        <Paper sx={{ height: 500 }} elevation={3}>
            <CssBaseline />
            <GlobalStyles
                styles={(theme) => ({
                    body: { backgroundColor: theme.palette.background.paper },
                })}
            />
            <AppBar position="static" color="primary">
                <Toolbar>
                    <Typography variant="h6" color="inherit" component="div">
                        Communication Messages
                    </Typography>
                </Toolbar>
            </AppBar>
            <Container className='chat-template' sx={{ overflow: 'auto', height: 'calc(100% - 110px)' }}>
                {list.map(e => {
                    if (e.isAdmin === true) {
                        return <MessageLeft key={e._id} title={e.email} content={e.content} timestamp={e.createdAt} documents={e.documents} />
                    }
                    return <MessageRight key={e._id} title={e.email} content={e.content} timestamp={e.createdAt} documents={e.documents} />
                })}
            </Container>
            <CustomizedInputBase id={id} handleRefresh={() => setRefresh(e => !e)} />
        </Paper>

    );
}

function MessageLeft({ title, content, timestamp, documents = [] }) {
    return <MessageTemplate title={title} content={content} timestamp={timestamp} documents={documents} align='left' />
}

function MessageRight({ title, content, timestamp, documents = [] }) {
    return <MessageTemplate title={title} content={content} timestamp={timestamp} documents={documents} align='right' />
}

function MessageTemplate({ title, content, timestamp, align, documents = [] }) {
    const handleDownload = (id, filename) => {
        DownloadDocumentById(id).then(resp => {
            saveFile(resp.data, filename)
        })
    }

    const saveFile = (blob, filename) => {
        if (window.navigator.msSaveOrOpenBlob) {
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
    }

    return <div className='col-12' style={{ textAlign: align }}>
        <Typography variant='overline'>{title}</Typography>
        <div className='w-100 m-1' />
        {documents.length === 0 && <Typography sx={
            { backgroundColor: blue[50], padding: '10px', borderRadius: '10px', margin: '5px' }
        } variant='subtitle2'>
            {content}
        </Typography>}
        {documents.map((x, idx) => {
            return <Button variant='outlined' onClick={() => handleDownload(x, content)} key={idx}>{content}</Button>
        })}
        <div className='w-100 m-1' />
        <Typography variant='caption'>{moment(timestamp).format('MM/DD/YYYY HH:mm A')}</Typography>
    </div>
}

function CustomizedInputBase({ id, handleRefresh }) {
    const [data, setData] = useState();
    const [file, setFile] = useState(false);

    const addMessage = () => {
        const message = { listId: id, content: data }
        AddMessage(id, message).then(() => {
            setData('')
            handleRefresh()
        })
    }

    const onRefresh = () => {
        setFile(false)
        setData('')
        handleRefresh()
    }

    const keyHandler = (e) => {
        if (e.keyCode === 13)
            addMessage()
    }

    return (
        <Paper
            onKeyDown={keyHandler}
            component="form"
            sx={{ p: '2px 4px', display: 'flex', alignItems: 'center' }}
        >
            {file && <FileUpload id={id} handleRefresh={onRefresh} />}
            <IconButton onClick={() => setFile(e => !e)} sx={{ p: '10px' }} >
                <AttachmentIcon />
            </IconButton>
            <InputBase
                sx={{ ml: 1, flex: 1 }}
                placeholder="Send Message"
                onChange={e => setData(e.target.value)}
                value={data}
                multiline
                color='warning'
            />
            <IconButton onClick={addMessage} sx={{ p: '10px' }}>
                <SendIcon />
            </IconButton>
        </Paper>
    );
}

function FileUpload({ id, handleRefresh }) {

    const handleUpload = (evt) => {
        debugger
        const files = evt.target.files;
        if (files && files.length > 0) {
            const file = files[0];
            const formData = new FormData()
            formData.append('typeId', id)
            formData.append('file', file)
            UploadDocument(formData).then(resp => {
                AddMessage(id, { documents: [resp.data], content: file.name, listId: id }).then(handleRefresh)
            })
        }
    }

    return <input className='form-control' type='file' onChange={handleUpload} />
}

export const MessageFullScreen = () => {
    const { id } = useParams()

    return <MessageDialog id={id} open={true} handleClose={() => { }} />
}