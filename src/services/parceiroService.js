import { api } from './api';

const URI = '/parceiros';

/**
 * Lists all partners.
 * @param {number} page
 * @param {number} pageSize
 * @returns {Promise<any>}
 */
const listar = (page = 1, pageSize = 20) => {
  return api.get(`${URI}?page=${page}&page_size=${pageSize}`);
};

/**
 * Creates a new partner.
 * @param {object} dados
 * @returns {Promise<any>}
 */
const criar = (dados) => {
  return api.post(URI, dados);
};

/**
 * Fetches the summary for a single partner.
 * @param {string} id
 * @returns {Promise<any>}
 */
const buscarResumo = (id) => {
  return api.get(`${URI}/${id}/resumo`);
};

/**
 * Fetches the solicitations for a single partner.
 * @param {string} id
 * @returns {Promise<any>}
 */
const buscarSolicitacoes = (id) => {
  return api.get(`${URI}/${id}/solicitacoes`);
};

export const parceiroService = {
  listar,
  criar,
  buscarResumo,
  buscarSolicitacoes,
};
