import React from "react";
import Zoom from '@mui/material/Zoom';
import clsx from 'clsx'
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import { makeStyles } from '@mui/styles';
import Access from "../../Utils/authorize";
import { links, getAvailable } from '../../App'

const useStyles = makeStyles((theme) => ({
    parent: {
        cursor: 'pointer',
        transition: 'transform .2s',
        '&:hover': {
            transform: 'scale(1.1)'
        }
    },
}));




export default function Home() {
    // return <p>Logged In</p>
    return (
        <Template list={getAvailable(links).filter((e, idx) => idx !== 0)} />
    )
}



function Template({ list = [], title, invert = false }) {
    const classes = useStyles();
    const navigate = useNavigate()
    const theme = useTheme();

    const handleLink = (link, external,params) => {
        if (external)
            window.location.href = link
        else
            navigate(link, { replace: true,state:{location:params} })
    }

    const transitionDuration = {
        enter: theme.transitions.duration.enteringScreen,
        exit: theme.transitions.duration.leavingScreen,
    };

    return <React.Fragment>
        {title && <h5 className='text-center p-3'>{title}</h5>}
        <div className='row px-3'>
            {list.filter(x => {
                if (x.external)
                    return !Access.isInternal()
                return x.secure === true ? Access.isInternal() : true
            }).map((e, i) => {
                return <div onClick={() => handleLink(e.link, e.outside,e?.params)} key={i}
                    className={clsx(classes.parent, 'text-center', 'col-sm-6', 'col-md-3', 'col-xs-12', 'mt-3', invert ? 'mx-auto' : '')}
                    style={{ zIndex: 99 }}
                >
                    <div className={clsx('p-3', invert ? 'bg-dark' : 'bg-light', 'rounded')} >
                        <Zoom in timeout={transitionDuration} unmountOnExit style={{
                            transitionDelay: `${transitionDuration.exit}ms`,
                        }}>
                            {/* <FontAwesomeIcon color={invert ? '#fff' : '#000'} icon={e.icon} size='4x' /> */}
                            {e.icon}
                        </Zoom>
                        <h5 className={clsx('p-3', invert ? 'text-light' : 'text-dark')} >{e.text}</h5>
                    </div>
                </div>
            })}
        </div>
    </React.Fragment >
}