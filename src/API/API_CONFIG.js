import axios from 'axios';

const API_CONFIG = axios.create({
  baseURL: '/route',
});

export default API_CONFIG;