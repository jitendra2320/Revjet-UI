import axios from 'axios';

export const createPayment = (entity) => axios.post(process.env.REACT_APP_API_URL + '/payment', entity, {
    headers: {
        'Content-Type': 'application/json',
    }
})
