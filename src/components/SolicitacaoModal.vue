<script setup>
import { ref, reactive, watch } from 'vue';

import { solicitacaoService } from '@/services/solicitacaoService';

const props = defineProps({
  isOpen: Boolean
});

const emit = defineEmits(['close', 'solicitation-success']);

const form = reactive({
  quantidade_vidas: 1,
  vidas: [null],
  cobertura: 'Nacional',
  cidade: '',
  uf: '',
  cpf: '',
  cnpj: '',
  tipo_contratacao: 'Pessoa Física',
  operadoras_preferidas: []
});

const loading = ref(false);
const error = ref(null);

const operadoras = [
  "Amil", "Bradesco Saúde", "SulAmérica", "Porto Saúde", 
  "Hapvida", "Plenum Saúde", "MedSênior", "Best Senior", "Unity"
];

watch(() => form.quantidade_vidas, (newVal, oldVal) => {
  const newCount = Number(newVal) || 1;
  const oldCount = form.vidas.length;

  if (newCount > oldCount) {
    for (let i = 0; i < newCount - oldCount; i++) {
      form.vidas.push(null);
    }
  } else if (newCount < oldCount) {
    form.vidas.splice(newCount);
  }
});

const handleSubmit = async () => {
  loading.value = true;
  error.value = null;

  // Prepara o payload, garantindo que as vidas são números e no novo formato
  const transformedVidas = form.vidas
    .map(vida => Number(vida))
    .filter(vida => vida > 0)
    .map(idade => ({ idade })); // Transforma [12, 45] para [{ idade: 12 }, { idade: 45 }]

  const transformedCobertura = form.cobertura.toLowerCase(); // Converte para minúsculas

  // Cria o payload final sem 'quantidade_vidas' e 'tipo_contratacao'
  const payload = {
    parceiro_id: localStorage.getItem("ref_parceiro") || "SEM_REF",
    vidas: transformedVidas,
    cobertura: transformedCobertura,
    cidade: form.cidade,
    uf: form.uf,
    cpf: form.cpf,
    cnpj: form.cnpj,
    operadoras_preferidas: form.operadoras_preferidas,
  };

  if (transformedVidas.length !== form.quantidade_vidas) {
    error.value = "Preencha a idade de todas as vidas."
    loading.value = false;
    return;
  }

  try {
    const result = await solicitacaoService.criar(payload);
    emit('solicitation-success', result.protocolo);
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};

const close = () => {
  // Reset form e erros ao fechar
  Object.assign(form, {
    quantidade_vidas: 1,
    vidas: [null],
    cobertura: 'Nacional',
    cidade: '',
    uf: '',
    cpf: '',
    cnpj: '',
    tipo_contratacao: 'Pessoa Física',
    operadoras_preferidas: []
  });
  error.value = null;
  loading.value = false;
  emit('close');
};
</script>

<template>
  <Transition name="modal">
    <div v-if="isOpen" class="modal-overlay" @click.self="close">
      <div class="modal-content glass-effect">
        <button class="close-btn" @click="close">&times;</button>
        
        <div class="form-container">
          <h1>Formulário de Solicitação</h1>
          <p class="subtitle">Preencha os dados abaixo para iniciarmos sua solicitação.</p>
          
          <form @submit.prevent="handleSubmit">
            <!-- Campos Obrigatórios -->
            <div class="form-grid">
              <div class="form-group">
                <label for="quantidade_vidas">Quantidade de Vidas</label>
                <input type="number" id="quantidade_vidas" v-model="form.quantidade_vidas" min="1" required />
              </div>

              <div class="form-group">
                <label for="cobertura">Tipo de Cobertura</label>
                <select id="cobertura" v-model="form.cobertura">
                  <option value="Nacional">Nacional</option>
                  <option value="Regional">Regional</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label>Idade de cada vida</label>
              <div class="idades-grid">
                <input
                  v-for="(vida, index) in form.vidas"
                  :key="index"
                  type="number"
                  v-model.number="form.vidas[index]"
                  :placeholder="`Idade ${index + 1}`"
                  min="0"
                  required
                  class="idade-input"
                />
              </div>
            </div>

            <!-- Campos Opcionais -->
            <h2 class="optional-title">Dados Adicionais (Opcional)</h2>
            
            <div class="form-grid">
              <div class="form-group">
                <label for="cidade">Cidade</label>
                <input type="text" id="cidade" v-model="form.cidade" placeholder="Ex: Brasília" />
              </div>
              <div class="form-group">
                <label for="uf">UF</label>
                <input type="text" id="uf" v-model="form.uf" placeholder="Ex: DF" />
              </div>
            </div>
            
            <div class="form-group">
              <label for="tipo_contratacao">Tipo de Contratação</label>
              <select id="tipo_contratacao" v-model="form.tipo_contratacao">
                <option value="Pessoa Física">Pessoa Física</option>
                <option value="Pessoa Jurídica">Pessoa Jurídica</option>
              </select>
            </div>

            <div class="form-group" v-if="form.tipo_contratacao === 'Pessoa Física'">
              <label for="cpf">CPF</label>
              <input type="text" id="cpf" v-model="form.cpf" placeholder="000.000.000-00" />
            </div>

            <div class="form-group" v-if="form.tipo_contratacao === 'Pessoa Jurídica'">
              <label for="cnpj">CNPJ</label>
              <input type="text" id="cnpj" v-model="form.cnpj" placeholder="00.000.000/0001-00" />
            </div>

            <div class="form-group">
              <label>Operadoras Preferidas</label>
              <div class="checkbox-group">
                <label v-for="op in operadoras" :key="op" class="checkbox-label">
                  <input type="checkbox" :value="op" v-model="form.operadoras_preferidas" />
                  {{ op }}
                </label>
              </div>
            </div>

            <button type="submit" :disabled="loading" class="btn-primary">
              {{ loading ? 'Enviando...' : 'Enviar Solicitação' }}
            </button>
          </form>

          <p v-if="error" class="error-msg">{{ error }}</p>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
/* Estilos gerais do modal (overlay, content, close-btn) */
.modal-overlay {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(5, 10, 24, 0.85); display: flex;
  justify-content: center; align-items: center; z-index: 1000;
  backdrop-filter: blur(10px);
}
.modal-content {
  background: rgba(15, 23, 42, 0.95); backdrop-filter: blur(20px);
  padding: 32px; border-radius: 32px; width: 90%; max-width: 520px;
  max-height: 90vh; overflow-y: auto; position: relative; color: #f8fafc;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 25px 50px rgba(0,0,0,0.5);
}
.close-btn {
  position: absolute; top: 20px; right: 25px; background: none; border: none;
  font-size: 32px; cursor: pointer; color: #94a3b8; transition: color 0.2s;
}
.close-btn:hover { color: #f8fafc; }

/* Títulos e subtítulos */
h1 {
  font-size: 24px; margin-bottom: 8px; font-weight: 800; text-align: center;
}
.subtitle {
  text-align: center; color: #94a3b8; margin-bottom: 32px; font-size: 15px;
}
.optional-title {
  font-size: 16px; color: #cbd5e1; font-weight: 700; margin-top: 30px;
  margin-bottom: 20px; text-align: center; border-top: 1px solid rgba(255,255,255,0.1);
  padding-top: 20px;
}

/* Grupos de formulário e Grids */
.form-group { margin-bottom: 20px; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.idades-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(80px, 1fr)); gap: 10px; }

/* Labels */
label { display: block; margin-bottom: 8px; font-weight: 600; color: #e2e8f0; font-size: 14px; }

/* Inputs e Selects */
input, select {
  width: 100%; padding: 14px; background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px;
  font-size: 16px; color: #ffffff; transition: all 0.2s; box-sizing: border-box;
}
input:focus, select:focus {
  outline: none; border-color: #00d1ff; background: rgba(255, 255, 255, 0.08);
}
select option { background-color: #0f172a; color: #ffffff; }

/* Checkbox Group */
.checkbox-group {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
  gap: 12px; background: rgba(255,255,255,0.02); padding: 16px;
  border-radius: 12px; border: 1px solid rgba(255,255,255,0.08);
}
.checkbox-label {
  display: flex; align-items: center; font-size: 14px; color: #cbd5e1;
  font-weight: 500; cursor: pointer;
}
.checkbox-label input { width: auto; margin-right: 10px; }

/* Botão Primário */
.btn-primary {
  width: 100%; padding: 16px; background: linear-gradient(135deg, #00D1FF 0%, #007BFF 100%);
  color: white; border: none; border-radius: 16px; font-size: 18px; font-weight: 800;
  cursor: pointer; margin-top: 25px; box-shadow: 0 8px 20px rgba(0, 123, 255, 0.3);
  transition: all 0.2s;
}
.btn-primary:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 10px 25px rgba(0, 123, 255, 0.4); }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

/* Mensagem de Erro */
.error-msg {
  color: #ff4d4d; font-size: 14px; margin-top: 16px; text-align: center;
  background: rgba(255, 77, 77, 0.1); padding: 10px; border-radius: 8px;
}

/* Transições */
.modal-enter-active, .modal-leave-active { transition: opacity 0.4s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-active .modal-content, .modal-leave-active .modal-content {
  transition: transform 0.4s cubic-bezier(0.23, 1, 0.32, 1);
}
.modal-enter-from .modal-content, .modal-leave-to .modal-content {
  transform: scale(0.95) translateY(20px);
}
</style>
