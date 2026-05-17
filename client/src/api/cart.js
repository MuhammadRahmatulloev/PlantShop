import api from './axios'

export const getCart = () => api.get('/cart/me/')
export const addToCart = (plant_id, quantity = 1) =>
  api.post('/cart/add/', { plant_id, quantity })
export const removeFromCart = (id) => api.delete(`/cart/${id}/remove_item/`)
export const clearCart = () => api.delete('/cart/clear/')