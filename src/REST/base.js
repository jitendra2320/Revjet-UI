import Axios from 'axios';
import authorize from '../Utils/authorize';
import DefaultSettings from '../Utils/settings';

const URL = process.env.REACT_APP_API_URL

function Base(done, fail, url = URL, params = null) {
    const instance = Axios.create({
        baseURL: url,
        headers: {
            'Authorization': 'Bearer ' + authorize.getToken(),
            'Grant': authorize.getIdToken()
        },
        ...params
    })

    instance.interceptors.request.use(function (config) {
        if (DefaultSettings.getLoader() != null)
            DefaultSettings.getLoader().add();
        return config;
    }, function (error) {
        return Promise.reject(error);
    })

    instance.interceptors.response.use(function (response) {
        if (DefaultSettings.getLoader() != null)
            DefaultSettings.getLoader().remove();
        if (DefaultSettings.getAlert() != null && done !== null && done !== undefined)
            DefaultSettings.getAlert().show(done, 'success');
        return response
    }, function (error) {
        //const _originalRequest = error.config;
        if (error.response.status === 401) {
             
                sessionStorage.clear()
                localStorage.clear()
                if (DefaultSettings.getLoader() != null)
                    DefaultSettings.getLoader().remove();
                if (DefaultSettings.getAlert() != null)
                    DefaultSettings.getAlert().show(fail || 'Error Occurred', 'error');
                return Promise.reject(error);
             
        }
        else {
            if (DefaultSettings.getLoader() != null)
                DefaultSettings.getLoader().remove();
            if (DefaultSettings.getAlert() != null)
                DefaultSettings.getAlert().show(fail || 'Error Occurred', 'error');
            return Promise.reject(error);
        }
    });

    return instance;
}

export async function refresh(token, refreshToken) {
    return Axios.post(URL + '/Authorize/Refresh', { token, refreshToken })
}

export default function ApiAxios(done, fail, params = null) {
    return Base(done, fail, URL + '/api', params)
}
export const BaseAxios = Base