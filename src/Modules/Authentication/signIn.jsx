import React from 'react'
import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { GetToken, GetUser, GetAccess } from '../../REST/authenticate'
import Access from '../../Utils/authorize'



export default function SignIn() {
    const { code } = useParams()
    const navigate = useNavigate()

    useEffect(() => {
        console.log(code)
        GetToken(code).then(resp => {
            GetUser(resp.data.accessToken).then(res => {
                console.log('user', res.data)
                //console.log('resp', resp)
                const { accessToken, refreshToken, idToken } = resp.data
                Access.setTokens('token', accessToken)
                Access.setTokens('refreshToken', refreshToken)
                Access.setTokens('idToken', idToken)
                Access.setUser(res.data)
                localStorage.setItem('idToken', idToken)
                localStorage.setItem('refreshToken', refreshToken)
                localStorage.setItem('token', accessToken)
                sessionStorage.setItem('expiresIn', new Date().getTime() + 3600 * 1000)
                localStorage.setItem('user', JSON.stringify(res.data))
                GetAccess().then(user => {
                    sessionStorage.setItem('access', user.data.access)
                    sessionStorage.setItem('modules', user.data.modules)
                    localStorage.setItem('access', user.data.access)
                    localStorage.setItem('modules', user.data.modules)
                    global.location.href =  '#/'//, { replace: true })
                }).catch(err => {
                    sessionStorage.clear()
                })
            })
        })
    }, [code, navigate])

    return <div>Validating Token</div>

}