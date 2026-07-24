import { api } from './api';

export const templateService = {
  /**
   * Busca o layout de um template específico.
   * @param {string} templateId O ID do template (ex: 'modelo-cartaz-001.png').
   * @returns {Promise<object>} O objeto de layout.
   */
  async getLayout(templateId) {
    try {
      // A instância do 'api' já retorna response.data
      return await api.get(`/templates/${templateId}/layout`);
    } catch (error) {
      // Não loga o erro 404 como um problema, pois é esperado que um layout customizado não exista.
      if (error.response && error.response.status !== 404) {
        console.error(`Erro ao buscar layout para o template ${templateId}:`, error);
      }
      throw error; // Propaga o erro para ser tratado no componente
    }
  },

  /**
   * Salva o layout customizado de um template.
   * @param {string} templateId O ID do template.
   * @param {object} layout O objeto de layout a ser salvo.
   * @returns {Promise<any>}
   */
  async saveLayout(templateId, layout) {
    // O método post já retorna a resposta da API (response.data)
    return api.put(`/templates/${templateId}/layout`, layout);
  },
};