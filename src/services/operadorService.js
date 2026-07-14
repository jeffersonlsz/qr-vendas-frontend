import { api } from './api';

const URI = '/operadores';

/**
 * Lists all operators.
 * @returns {Promise<any>}
 */
const listar = () => {
  return api.get(URI);
};

export const operadorService = {
  listar,
};
