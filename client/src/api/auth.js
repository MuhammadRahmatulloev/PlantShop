import axios from 'axios'

const BASE = 'http://localhost:8000'

export const login = (username, password) =>
  axios.post(`${BASE}/api/token/`, { username, password })

export const register = (data) =>
  axios.post(`${BASE}/api/register/`, data)

export const verifyEmail = (email, code) =>
  axios.post(`${BASE}/api/verify/`, { email, code })

export const forgotPassword = (email) =>
  axios.post(`${BASE}/api/forgot-password/`, { email })

export const resetPassword = (uid, token, password) =>
  axios.post(`${BASE}/api/reset-password/`, { uid, token, password })