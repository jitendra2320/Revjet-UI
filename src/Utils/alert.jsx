import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { SnackbarProvider, useSnackbar } from 'notistack';

function Alert(props, ref) {
    const { enqueueSnackbar } = useSnackbar();

    useImperativeHandle(ref, () => ({
        showAlert: (message, variant) => {
            if (typeof message === 'string') {
                if (variant) {
                    enqueueSnackbar(message, { variant })
                }
                else
                    enqueueSnackbar(message);
            }
        }
    }))

    return (
        <div />
    );
}

const AlertView = forwardRef(Alert)

function IntegrationNotistack(count = 3, ref) {

    const alertView = useRef(null);

    useImperativeHandle(ref, () => (
        {
            show: (message, variant) => {
                if (alertView && alertView.current)
                    alertView.current.showAlert(message, variant)
            }
        }
    ))

    return (
        <SnackbarProvider maxSnack={count}>
            <AlertView ref={alertView} />
        </SnackbarProvider>
    );
}

export default forwardRef(IntegrationNotistack);