import { api } from './api';

const URI = '/solicitacoes';

/**
 * Lists all solicitations.
 * @returns {Promise<any>}
 */
const listar = () => {
  return api.get(URI);
};

/**
 * Fetches a single solicitation by its ID.
 * @param {string} id
 * @returns {Promise<any>}
 */
const buscar = (id) => {
  return api.get(`${URI}/${id}`);
};

/**
 * Creates a new solicitation.
 * @param {object} dados - The solicitation data.
 * @returns {Promise<any>}
 */
const criar = (dados) => {
  return api.post(URI, dados);
};

/**
 * Updates the status of a solicitation.
 * @param {string} id
 * @param {string} status
 * @returns {Promise<any>}
 */
const alterarStatus = (id, status) => {
  return api.patch(`${URI}/${id}/status`, { status });
};

/**
 * Updates the commercial data of a solicitation.
 * @param {string} id
 * @param {object} dados
 * @returns {Promise<any>}
 */
const atualizarDadosComerciais = (id, dados) => {
  return api.patch(`${URI}/${id}/dados-comerciais`, dados);
};

/**
 * Fetches the status history of a solicitation.
 * @param {string} id
 * @returns {Promise<any>}
 */
const buscarHistorico = (id) => {
  return api.get(`${URI}/${id}/historico`);
};

/**
 * Starts the WhatsApp attendance flow by creating a solicitation and returning a WhatsApp URL.
 * @param {object} dados - The solicitation data.
 * @returns {Promise<any>}
 */
const iniciarAtendimentoWhatsApp = (dados) => {
  return api.post(`${URI}/iniciar-atendimento-whatsapp`, dados);
};

export const solicitacaoService = {
  listar,
  buscar,
  criar,
  alterarStatus,
  atualizarDadosComerciais,
  buscarHistorico,
  iniciarAtendimentoWhatsApp,
};
