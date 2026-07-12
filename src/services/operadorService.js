import { api } from './api';

const URI = '/api/v1/operadores';

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
