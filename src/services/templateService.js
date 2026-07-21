import axios from 'axios';

const apiHost = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/+$/, '');
const apiPrefix = '/api/v1';
const API_URL = apiHost.endsWith(apiPrefix) ? apiHost : `${apiHost}${apiPrefix}`;

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const templateService = {
  /**
   * Busca o layout de um template específico.
   * @param {string} templateId O ID do template (ex: 'modelo001').
   * @returns {Promise<object>} O objeto de layout.
   */
  async getLayout(templateId) {
    try {
      const response = await apiClient.get(`/templates/${templateId}/layout`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar layout para o template ${templateId}:`, error);
      throw error; // Propaga o erro para ser tratado no componente
    }
  },

  /**
   * Salva o layout de um template específico.
   * @param {string} templateId O ID do template.
   * @param {object} layout O objeto de layout a ser salvo.
   * @returns {Promise<object>} A resposta da API.
   */
  async saveLayout(templateId, layout) {
    try {
      const response = await apiClient.put(`/templates/${templateId}/layout`, layout);
      return response.data;
    } catch (error) {
      console.error(`Erro ao salvar layout para o template ${templateId}:`, error);
      throw error;
    }
  },
};