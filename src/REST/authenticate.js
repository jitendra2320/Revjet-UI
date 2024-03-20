import Axios, { BaseAxios } from './base';
import axios from 'axios';

export const GetToken = (id) => BaseAxios('Welcome User', 'Session not Valid').get('Authorize/' + id)

export const GetUser = (accessToken) => axios.get(process.env.REACT_APP_COGNITO_URL + '/oauth2/userInfo', {
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + accessToken
    }
})

export const GetCSRF = () => axios.get(process.env.REACT_APP_API_URL + '/CSRF').then(resp => {
    axios.defaults.headers.post['X-CSRF-Token'] = resp.data.csrfToken
    axios.defaults.headers.put['X-CSRF-Token'] = resp.data.csrfToken
    axios.defaults.headers.delete['X-CSRF-Token'] = resp.data.csrfToken
})

export const GetAccess = () => Axios().get('Access')