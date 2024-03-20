import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';
import Slide from '@mui/material/Slide';
import { useParams } from 'react-router-dom'

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

export default function MapSelectView({ text = null, refresh }) {
    const [open, setOpen] = React.useState(false);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        refresh()
    };

    return (
        <div>
            <Button variant="outlined" onClick={handleClickOpen}>
                {text ? text.join(',') : 'Select Location'}
            </Button>
            <Dialog
                fullScreen
                open={open}
                onClose={handleClose}
                TransitionComponent={Transition}
            >
                <AppBar sx={{ position: 'relative' }}>
                    <Toolbar>
                        <IconButton
                            edge="start"
                            color="inherit"
                            onClick={handleClose}
                            aria-label="close"
                        >
                            <CloseIcon />
                        </IconButton>
                        <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
                            Select Location
                        </Typography>
                    </Toolbar>
                </AppBar>
                <MapView />
            </Dialog>
        </div>
    );
}


function MapView() {
    const { id } = useParams()

    return <React.Fragment>
        <iframe src={process.env.PUBLIC_URL + '/map.html?property=' + id}
            frameBorder="0"
            marginHeight="0"
            marginWidth="0"
            width="100%"
            height="100%"
            title='Template Editor'
            scrolling="auto" />
    </React.Fragment>
}