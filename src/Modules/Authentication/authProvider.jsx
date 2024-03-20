import React, { useEffect } from 'react';
import Access from '../../Utils/authorize';

export default function AuthProvider({ children, noAccess = () => <NoAccess /> }) {
    console.log(Access.user())

    useEffect(()=>{
        return ()=>{
            console.log('Unmount')
        }
    },[])
    
    if (Access.user())
        return children
    else
        return noAccess()
}

function NoAccess() {
    const SIGN_IN_URL = `${process.env.REACT_APP_COGNITO_URL}/login?response_type=code&client_id=${process.env.REACT_APP_COGNITO_CLIENT_ID}&redirect_uri=${process.env.REACT_APP_COGNITO_SIGNIN}&scope=${process.env.REACT_APP_COGNITO_SCOPE}`

    useEffect(() => {
        window.location.href = SIGN_IN_URL
    }, [SIGN_IN_URL])

    return <p>Redirecting to Login Page...</p>
}