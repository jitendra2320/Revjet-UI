import Button from '@mui/material/Button'
import { useEffect, useState } from 'react';
import { createPayment } from '../../REST/payment';

export function PayCard({ amount, onComplete }) {
    const [method, setMethod] = useState(null)

    useEffect(() => {
        setTimeout(() => {
            try {
                const payments = window.Square.payments('sandbox-sq0idb-meaeueTcCRotc79-w2ceAQ', 'T4RQW80D67TJW');
                payments.card().then(card => {
                    card.attach('#card-container').then(res => {
                        setMethod(card)
                    })
                })
            }
            catch (ex) {
                console.log(ex);
            }
        }, 2000)

    }, [])


    const handlePay = (evt) => {
        method.tokenize().then(tokenResult => {
            createPayment({ locationId: 'T4RQW80D67TJW', sourceId: tokenResult.token, amount: Math.floor(amount * 1000) }).then(resp => {
                if (typeof onComplete === 'function')
                    onComplete(resp.data)
            })
        })
    }

    return <div className='row'>
        <div className='col-12 bg-white'>
            <div id='card-container'></div>
            <Button color='primary' fullWidth size='large' variant='contained' onClick={handlePay}><b>Pay With Card</b></Button>
        </div>
    </div>
}

export function PayACH({ amount, accountHolderName, onComplete }) {
    const [method, setMethod] = useState(null)
    const [allow, setAllow] = useState(false)

    useEffect(() => {
        setTimeout(() => {
            try {
                const payments = window.Square.payments('sandbox-sq0idb-meaeueTcCRotc79-w2ceAQ', 'T4RQW80D67TJW');
                payments.ach().then(ach => {
                    setMethod(ach)
                    setAllow(true)
                })
            }
            catch (ex) {
                console.log(ex);
            }
        }, 2000)

    }, [])

    const handlePay = (evt) => {
        const options = { accountHolderName }
        method.tokenize(options).then(tokenResult => {
            createPayment({ locationId: 'T4RQW80D67TJW', sourceId: tokenResult.token, amount: amount * 1000 }).then(resp => {
                if (typeof onComplete === 'function')
                    onComplete(resp.data)
            })
        })
    }

    return <div className='row'>
        <div className='col-12 bg-white'>
            <Button disabled={!allow} color='primary' fullWidth size='large' variant='contained' onClick={handlePay}><b>Pay With Bank Account</b></Button>
        </div>
    </div >
}


export function PayManual({ amount, onComplete }) {
    const handleClick = () => {
        if (typeof onComplete === 'function')
            onComplete()
    }

    return <Button color='primary' fullWidth size='large' onClick={handleClick} variant='contained'><b>Manual Payment for ${amount}</b></Button>
}