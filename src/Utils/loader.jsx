import React, { useState, forwardRef, useImperativeHandle } from 'react';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import { styled } from '@mui/material/styles';


const StyledBackDrop = styled(Backdrop)(({ theme }) => ({
    zIndex: theme.zIndex.modal + 1,
    color: '#fff',
}));

function SimpleBackdrop(props, ref) {
    const [open, setOpen] = useState(false);

    const handleClose = () => {
        setOpen(false)
    };

    useImperativeHandle(ref, () => ({
        add: () => {
            Counter.addCount();
            setOpen(true);
        },
        remove: () => {
            Counter.reduceCount();
            if (Counter.getCount() === 0)
                setOpen(false)
        }
    }))

    return (
        <StyledBackDrop open={open} onClick={handleClose}>
            <CircularProgress color="inherit" />
        </StyledBackDrop>
    )
}

class Counter {
    static count = 0;

    static getCount() {
        return this.count;
    }

    static addCount() {
        this.count = this.count + 1;
    }

    static reduceCount() {
        if (this.count > 0)
            this.count = this.count - 1;
    }
}

export default forwardRef(SimpleBackdrop);