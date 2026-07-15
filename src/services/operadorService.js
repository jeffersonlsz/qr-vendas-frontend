import { api } from './api';

const URI = '/operadores';

/**
 * Lists all operators.
 * @returns {Promise<any>}
 */
const listar = () => {
  return api.get(URI);
};

/**
 * Creates a new operator.
 * @param {object} operador
 * @returns {Promise<any>}
 */
const criar = (operador) => {
  return api.post(URI, operador);
};

export const operadorService = {
  listar,
  criar,
};
