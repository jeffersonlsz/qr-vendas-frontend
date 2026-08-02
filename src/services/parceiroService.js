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

/**
 * Generates a batch of partners.
 * @param {{ quantidade: number, prefixo_nome: string }} data
 * @returns {Promise<any>}
 */
const gerarLote = (data) => {
  return api.post(`${URI}/lote`, data);
};

/**
 * Associates a card with a partner's details.
 * @param {string} id The ID of the partner/card to associate.
 * @param {object} dados The partner's data.
 * @returns {Promise<any>}
 */
const associar = (id, dados) => {
  return api.post(`${URI}/${id}/associar`, dados);
};

const listarTodos = (ativo = true) => {
    return api.get(`${URI}?ativo=${ativo}&page=1&page_size=100`);
};

const atualizar = (id, dados) => {
    return api.patch(`${URI}/${id}`, dados);
};

const deletar = (id) => {
    return api.delete(`${URI}/${id}`);
};


export const parceiroService = {
  listar,
  listarTodos,
  criar,
  buscarResumo,
  buscarSolicitacoes,
  gerarLote,
  associar,
  atualizar,
  deletar,
};
