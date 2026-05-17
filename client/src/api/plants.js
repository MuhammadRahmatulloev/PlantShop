import api from './axios'

export const getPlants = (params) => api.get('/plants/', { params })
export const getPlant = (slug) => api.get(`/plants/${slug}/`)
export const addReview = (slug, data) => api.post(`/plants/${slug}/reviews/`, data)