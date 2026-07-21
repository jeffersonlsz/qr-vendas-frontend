import axios from 'axios';

// 1. Cria uma instância do axios com a configuração base da API.
const apiHost = (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:8000')
  .replace(/\/+$/, '');
const apiPrefix = '/api/v1';
const baseURL = apiHost.endsWith(apiPrefix) ? apiHost : `${apiHost}${apiPrefix}`;

const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

console.log('[API] baseURL set to:', baseURL);

// 2. (Opcional, mas recomendado) Adiciona um interceptor para tratar respostas.
//    Isso ajuda a padronizar o retorno dos dados.
apiClient.interceptors.response.use(
  (response) => {
    // Retorna o payload completo do backend, preservando wrappers do tipo
    // { success: true, data: [...] } para que os componentes possam acessar
    // success e data normalmente.
    return response.data;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const api = apiClient;
export default apiClient;