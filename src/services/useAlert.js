import { reactive, readonly } from 'vue';

// 1. O estado do alerta é definido aqui, de forma centralizada.
// Ele é reativo, então qualquer mudança aqui será refletida na UI.
const state = reactive({
  isOpen: false,
  title: 'Atenção',
  message: '',
  type: 'warning', // 'warning', 'error', 'success', 'info'
});

/**
 * Exibe o modal de alerta global.
 * @param {string} title - O título do alerta.
 * @param {string} message - A mensagem principal do alerta.
 * @param {'warning'|'error'|'success'|'info'} [type='warning'] - O tipo de alerta.
 */
const showAlert = (title, message, type = 'warning') => {
  state.title = title;
  state.message = message;
  state.type = type;
  state.isOpen = true;
};

// 3. Função para esconder o modal.
const hideAlert = () => {
  state.isOpen = false;
};

// 4. Exportamos o estado (apenas para leitura) e as funções que o manipulam.
// Isso garante que o estado só possa ser modificado através das funções `showAlert` e `hideAlert`.
export const useAlert = () => ({
  alertState: readonly(state),
  showAlert,
  hideAlert,
});