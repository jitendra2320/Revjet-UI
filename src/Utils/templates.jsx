import React, { useState, useEffect, Fragment, useRef, forwardRef, useCallback } from 'react';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog';
import Slide from '@mui/material/Slide';

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

function DocumentEditor({ label, value, className, fields = [], onChange }, ref) {
    const [data, setData] = useState(value);
    const [open, setOpen] = React.useState(false);
    const [loading, setLoading] = useState(false);
    const frameView = useRef(null);


    const handleClickOpen = () => {
        setOpen(true);
        setLoading(true);
    };


    useEffect(() => {
        if (open === false)
            onChange(data)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open])

    useEffect(() => {
        setData(value)
    }, [value])

    useEffect(() => {
        if (open) {
            const handleSubmit = (data) => {
                setData(data);
                setOpen(false)
            }

            const handleClose = () => {
                setOpen(false);
                setData(value)
            };

            const messageHandler = (message) => {
                console.log(message)
                if (message.origin === process.env.REACT_APP_TEMPLATE_URL) {
                    if (message.data === 'Initialized' && frameView.current && frameView.current.contentWindow) {
                        setLoading(false);

                        frameView.current.contentWindow.postMessage({ render: 'Fields', fields, content: value }, "*")
                    }
                    else if (message.data === 'Close')
                        handleClose()
                    else
                        handleSubmit(message.data)
                }
            }
            window.addEventListener('message', messageHandler)

            return function cleanup() {
                console.log('Cleaned')
                window.removeEventListener('message', messageHandler);
            }
        }
    }, [fields, label, data, value, open])

    return (
        <div className={className || ''}>
            <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={loading} onClick={() => setLoading(false)}><CircularProgress color="inherit" /></Backdrop>
            <Button variant='text' fullWidth color="secondary" onClick={handleClickOpen}>
                {label}
            </Button>
            <Dialog fullScreen open={open} keepMounted={false} TransitionComponent={Transition}>
                <iframe src={process.env.REACT_APP_TEMPLATE_URL} ref={frameView}
                    frameBorder="0"
                    marginHeight="0"
                    marginWidth="0"
                    width="100%"
                    height="100%"
                    title='Template Editor'
                    scrolling="auto">
                </iframe>
            </Dialog>
        </div>
    );
}

const DocumentEditorRef = forwardRef(DocumentEditor)



function TemplateEditor({ errors = [], field, settings = [], module = null }) {
    if (module !== '' && module) {
        console.log(settings, module)
        const fields = settings.find(e => (Array.isArray(e) ? e[0].name : e.name) === module)

        return <DocumentEditorRef label='Template Editor' {...field} fields={Array.isArray(fields) ? fields : [fields]} />
    }
    return <Fragment></Fragment>
}

export default TemplateEditor