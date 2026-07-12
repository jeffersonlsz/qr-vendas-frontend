import { api } from './api';

const URI = '/operadores';

/**
 * Lists all operadores.
 * @returns {Promise<any>}
 */
const listarOperadores = () => {
  return api.get(URI);
};

/**
 * Creates a new operador.
 * @param {object} payload
 * @returns {Promise<any>}
 */
const criarOperador = (payload) => {
  return api.post(URI, payload);
};

export const operadorService = {
  listarOperadores,
  criarOperador,
};
