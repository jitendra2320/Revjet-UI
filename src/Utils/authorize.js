
const Access = {
    user: () => {
        if (localStorage.getItem('user') != null) {
            let temp = JSON.parse(localStorage.getItem('user'))
            return temp.username;
        }
        return null
    },
    isAdmin: (module) => {
        if (localStorage.getItem('access') === 'Internal' && module)
            return localStorage.getItem('modules').split(',').includes(module)
        return false
    },
    isInternal: () => {
        if (localStorage.getItem('access') === 'Internal'){
            sessionStorage.setItem('access', localStorage.getItem('access'))
            return true
        }
        return false
    },
    setToken: (token, refreshToken) => {
        sessionStorage.setItem('token', token)
        sessionStorage.setItem('refreshToken', refreshToken)
    },
    getToken: () => {
       
        return localStorage.getItem('token')
    },
    getIdToken: () => {
       
        return localStorage.getItem('idToken')
    },
    setUser: (data) => {
        return sessionStorage.setItem('user', JSON.stringify(data))
    },
    getFullname: () => {
        let tempUser = JSON.parse(localStorage.getItem('user'))
        return tempUser.given_name + ' ' + tempUser.family_name
    },
    removeToken: () => {
        sessionStorage.clear();
        localStorage.clear();
    },
    getRefreshToken: () => {
       
        return localStorage.getItem('refreshToken');
    },
    setTokens: (name, token) => {
        sessionStorage.setItem(name, token);
    },
    hasAccess: (name) => {
        if (localStorage.getItem('user') != null) {
            let modules = localStorage.getItem('modules')
            sessionStorage.setItem('refreshToken', localStorage.getItem('refreshToken'))
            sessionStorage.setItem('token',localStorage.getItem('token'));
            sessionStorage.setItem('idToken', localStorage.getItem('idToken'))
            sessionStorage.setItem('user', localStorage.getItem('user'))
            sessionStorage.setItem('modules', modules)
            return modules.split(',').includes(name);
        }
        return false
    },
    getUser: () => {
        if (localStorage.getItem('user') != null) {
           
            let temp = JSON.parse(localStorage.getItem('user'))
            return temp;
        }
        return null
    }
}

export default Access;