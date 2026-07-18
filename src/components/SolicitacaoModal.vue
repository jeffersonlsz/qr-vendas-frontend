<script setup>
import { ref, reactive, watch, computed } from 'vue';

import { solicitacaoService } from '@/services/solicitacaoService';

const props = defineProps({
  isOpen: Boolean
});

const emit = defineEmits(['close', 'solicitation-success']);

const currentStep = ref(1);

const form = reactive({
  quantidade_vidas: 1,
  vidas: [null],
  cobertura: 'Nacional',
  cidade: '',
  uf: 'DF', // Valor padrão alterado para DF
  cpf: '', // Mantido para compatibilidade do payload, mas removido da UI
  cnpj: '', // Mantido para compatibilidade do payload, mas removido da UI
  tipo_contratacao: 'Pessoa Física', operadoras_preferidas: []
});

const loading = ref(false);
const error = ref(null);

const operadoras = [
  "Amil", "Bradesco Saúde", "SulAmérica", "Porto Saúde", 
  "Hapvida", "Plenum Saúde", "MedSênior", "Best Senior", "Unity"
];

const ufs = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 
  'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

const capitais = [
  'Rio Branco', 'Maceió', 'Macapá', 'Manaus', 'Salvador', 'Fortaleza', 'Brasília', 
  'Vitória', 'Goiânia', 'São Luís', 'Cuiabá', 'Campo Grande', 'Belo Horizonte', 
  'Belém', 'João Pessoa', 'Curitiba', 'Recife', 'Teresina', 'Rio de Janeiro', 
  'Natal', 'Porto Alegre', 'Porto Velho', 'Boa Vista', 'Florianópolis', 'São Paulo', 
  'Aracaju', 'Palmas'
];


// --- Lógica do Wizard ---

const wizardConfig = {
  'Pessoa Física': [
    { title: 'Como será a contratação?', fields: ['tipo_contratacao'] },
    { title: 'Quantas vidas deseja incluir?', fields: ['quantidade_vidas'] },
    { title: 'Qual o tipo de cobertura?', fields: ['cobertura'] },
    { title: 'Qual a idade de cada vida?', fields: ['vidas'] },
    { title: 'Onde você mora?', fields: ['cidade', 'uf'] },
    { title: 'Preferência por operadora (Opcional)', fields: ['operadoras_preferidas'] },
  ],
  'Pessoa Jurídica': [
    { title: 'Como será a contratação?', fields: ['tipo_contratacao'] },
    { title: 'Qual tipo de cobertura deseja?', fields: ['cobertura'] },
    { title: 'Onde está localizada a empresa?', fields: ['cidade', 'uf'] },
    { title: 'Preferência por operadora (Opcional)', fields: ['operadoras_preferidas'] },
  ]
};

const activeSteps = computed(() => wizardConfig[form.tipo_contratacao]);
const totalSteps = computed(() => activeSteps.value.length);
const progress = computed(() => (currentStep.value / totalSteps.value) * 100);

const selectContractTypeAndNext = (type) => {
  form.tipo_contratacao = type;
  nextStep();
};

const selectCoverageAndNext = (type) => {
  form.cobertura = type;
  nextStep();
};

const selectLives = (count) => {
  form.quantidade_vidas = count;
};

const nextStep = () => {
  if (validateStep() && currentStep.value < totalSteps.value) {
    currentStep.value++;
  }
};

const prevStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--;
  }
};

const validateStep = () => {
  error.value = null;
  const currentFields = activeSteps.value[currentStep.value - 1].fields;

  if (currentFields.includes('quantidade_vidas') && form.quantidade_vidas < 1) {
    error.value = 'A quantidade de vidas deve ser de no mínimo 1.';
    return false;
  }

  if (currentFields.includes('vidas')) {
    const allAgesFilled = form.vidas.every(idade => idade !== null && idade !== '' && idade >= 0);
    if (!allAgesFilled) {
      error.value = 'Por favor, preencha a idade de todas as vidas.';
      return false;
    }
  }

  return true;
};

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

// Quando o tipo de contratação muda, reseta para a segunda etapa do novo fluxo
watch(() => form.tipo_contratacao, () => {
  if (currentStep.value > 1) {
    currentStep.value = 2;
  }
});

const handleSubmit = async () => {
  if (!validateStep()) return;

  loading.value = true;
  error.value = null;

  const transformedVidas = form.tipo_contratacao === 'Pessoa Física' ? form.vidas
    .map(vida => Number(vida))
    .filter(vida => vida > 0)
    .map(idade => ({ idade })) // Transforma [12, 45] para [{ idade: 12 }, { idade: 45 }]
    : [{idade: 99}]; // Para Pessoa Jurídica, envia uma vida fictícia com idade 99

  const transformedCobertura = form.cobertura.toLowerCase(); // Converte para minúsculas

  // Cria o payload final sem 'quantidade_vidas' e 'tipo_contratacao'
  // CPF e CNPJ são enviados mesmo que vazios, mantendo o contrato da API.
  const payload = {
    parceiro_id: localStorage.getItem("ref_parceiro") || "SEM_REF",
    vidas: transformedVidas,
    cobertura: transformedCobertura,
    cidade: form.cidade,
    uf: form.uf,
    cpf: form.cpf, // Removido da UI
    cnpj: form.cnpj, // Removido da UI
    operadoras_preferidas: form.operadoras_preferidas
  };

  if (form.tipo_contratacao === 'Pessoa Física' && transformedVidas.length !== form.quantidade_vidas) {
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
  // Reset form, erros e etapa ao fechar
  Object.assign(form, {
    quantidade_vidas: 1,
    vidas: [null],
    cobertura: 'Nacional',
    cidade: '', // Reset para o valor inicial
    uf: 'DF', // Reset para o valor padrão
    cpf: '',
    cnpj: '',
    tipo_contratacao: 'Pessoa Física',
    operadoras_preferidas: []
  });
  currentStep.value = 1;
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
        
        <!-- Barra de Progresso -->
        <div class="progress-container">
          <div class="progress-bar" :style="{ width: progress + '%' }"></div>
          <span class="progress-label">Etapa {{ currentStep }} de {{ totalSteps }}</span>
        </div>

        <div class="form-container">
          <h1>{{ activeSteps[currentStep - 1].title }}</h1>
          
          <form @submit.prevent="handleSubmit">
            <Transition name="slide-fade" mode="out-in">
              <div :key="currentStep">
                <!-- Etapa 1: Tipo de Contratação -->
                <div v-if="activeSteps[currentStep - 1].fields.includes('tipo_contratacao')" class="form-group contract-type-buttons">
                  <button
                    type="button"
                    class="btn-contract-type"
                    :class="{ 'active': form.tipo_contratacao === 'Pessoa Física' }"
                    @click="selectContractTypeAndNext('Pessoa Física')">
                    Pessoa Física
                  </button>
                  <button
                    type="button"
                    class="btn-contract-type"
                    :class="{ 'active': form.tipo_contratacao === 'Pessoa Jurídica' }"
                    @click="selectContractTypeAndNext('Pessoa Jurídica')">
                    Pessoa Jurídica
                  </button>
                </div>

                <!-- Etapa 2 (PF): Quantidade de Vidas -->
                <div v-if="activeSteps[currentStep - 1].fields.includes('quantidade_vidas')" class="form-group lives-selection">
                  <div class="lives-buttons">
                    <button type="button" class="btn-square" :class="{ 'active': form.quantidade_vidas === 1 }" @click="selectLives(1)">1</button>
                    <button type="button" class="btn-square" :class="{ 'active': form.quantidade_vidas === 2 }" @click="selectLives(2)">2</button>
                    <button type="button" class="btn-square" :class="{ 'active': form.quantidade_vidas === 3 }" @click="selectLives(3)">3</button>
                    <button type="button" class="btn-square" :class="{ 'active': form.quantidade_vidas >= 4 }" @click="selectLives(4)">4+</button>
                  </div>
                  <Transition name="slide-fade">
                    <div v-if="form.quantidade_vidas >= 4" class="custom-lives-input">
                      <label for="quantidade_vidas">Ou digite a quantidade exata:</label>
                      <input
                        type="number"
                        id="quantidade_vidas"
                        v-model="form.quantidade_vidas"
                        min="4"
                        required
                      />
                    </div>
                  </Transition>
                </div>

                <!-- Etapa 3 (PF) / 2 (PJ): Cobertura -->
                <div v-if="activeSteps[currentStep - 1].fields.includes('cobertura')" class="form-group contract-type-buttons">
                   <button
                    type="button"
                    class="btn-contract-type"
                    :class="{ 'active': form.cobertura === 'Regional' }"
                    @click="selectCoverageAndNext('Regional')">
                    Regional
                  </button>
                  <button
                    type="button"
                    class="btn-contract-type"
                    :class="{ 'active': form.cobertura === 'Nacional' }"
                    @click="selectCoverageAndNext('Nacional')">
                    Nacional
                  </button>
                </div>

                <!-- Etapa 4 (PF): Idades -->
                <div v-if="activeSteps[currentStep - 1].fields.includes('vidas')" class="form-group">
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

                <!-- Etapa 5 (PF) / 3 (PJ): Localização -->
                <div v-if="activeSteps[currentStep - 1].fields.includes('cidade')" class="form-grid">
                  <div class="form-group">
                    <label for="cidade">Cidade</label>
                    <input type="text" id="cidade" v-model="form.cidade" placeholder="Ex: Brasília" list="capitais-list" />
                    <datalist id="capitais-list">
                      <option v-for="capital in capitais" :key="capital" :value="capital"></option>
                    </datalist>
                  </div>
                  <div class="form-group">
                    <label for="uf">UF</label>
                    <select id="uf" v-model="form.uf">
                      <option v-for="estado in ufs" :key="estado" :value="estado">{{ estado }}</option>
                    </select>
                  </div>
                </div>

                <!-- Etapa 6 (PF) / 4 (PJ): Operadoras -->
                <div v-if="activeSteps[currentStep - 1].fields.includes('operadoras_preferidas')" class="form-group">
                  <div class="checkbox-group">
                    <label v-for="op in operadoras" :key="op" class="checkbox-label">
                      <input type="checkbox" :value="op" v-model="form.operadoras_preferidas" />
                      {{ op }}
                    </label>
                  </div>
                </div>
              </div>
            </Transition>

            <!-- Navegação do Wizard -->
            <div class="navigation-buttons">
              <button type="button" @click="prevStep" v-if="currentStep > 1" class="btn-secondary">
                Anterior
              </button>

              <button type="button" @click="nextStep" v-if="currentStep < totalSteps" class="btn-primary">
                Próximo
              </button>

              <button type="submit" :disabled="loading" v-if="currentStep === totalSteps" class="btn-primary">
                {{ loading ? 'Enviando...' : 'Enviar Solicitação' }}
              </button>
            </div>
          </form>

          <p v-if="error" class="error-msg">{{ error }}</p>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
/* --- Estilos do Wizard --- */
.progress-container {
  width: 100%;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  margin-bottom: 24px;
  height: 10px;
  position: relative;
}
.progress-bar {
  height: 100%;
  background: linear-gradient(135deg, #00D1FF 0%, #007BFF 100%);
  border-radius: 10px;
  transition: width 0.4s ease;
}
.progress-label {
  position: absolute;
  top: -20px;
  right: 0;
  font-size: 12px;
  color: #94a3b8;
}
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
  font-size: 22px; margin-bottom: 24px; font-weight: 800; text-align: center;
  min-height: 50px; /* Evita pulos de layout */
  display: flex; align-items: center; justify-content: center;
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

/* Botões de Navegação e Tipo de Contrato */
.navigation-buttons {
  display: flex;
  justify-content: space-between;
  margin-top: 30px;
  gap: 16px;
}
.btn-primary, .btn-secondary {
  width: 100%; padding: 16px; color: white; border: none; border-radius: 16px; font-size: 18px; font-weight: 800;
  cursor: pointer; transition: all 0.2s;
}
.btn-primary {
  background: linear-gradient(135deg, #00D1FF 0%, #007BFF 100%);
  box-shadow: 0 8px 20px rgba(0, 123, 255, 0.3);
}
.btn-primary:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 10px 25px rgba(0, 123, 255, 0.4); }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

.btn-secondary {
  width: 100%;
  background-color: rgba(255, 255, 255, 0.1);
}
.btn-secondary:hover { background-color: rgba(255, 255, 255, 0.2); }

/* Mensagem de Erro */
.error-msg {
  color: #ff4d4d; font-size: 14px; margin-top: 16px; text-align: center;
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

/* Animação de Slide entre etapas */
.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}
.slide-fade-leave-active {
  transition: all 0.3s cubic-bezier(1, 0.5, 0.8, 1);
}
.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(20px);
  opacity: 0;
}

/* Botões de tipo de contratação */
.contract-type-buttons {
  display: flex;
  flex-direction: row; /* Alterado para linha */
  gap: 16px;
}
.btn-contract-type {
  width: 100%;
  padding: 16px;
  color: white;
  border-radius: 16px;
  font-size: 18px;
  font-weight: 800;
  cursor: pointer;
  background-color: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
.btn-contract-type.active, .btn-contract-type:hover {
  background-color: rgba(0, 193, 255, 0.2);
  border-color: #00D1FF;
}

/* Botões de quantidade de vidas */
.lives-selection {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}
.lives-buttons {
  display: flex;
  justify-content: center;
  gap: 16px;
  width: 100%;
}
.btn-square {
  width: 64px;
  height: 64px;
  padding: 0;
  font-size: 24px;
  font-weight: 700;
  border-radius: 16px;
  background-color: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-square.active, .btn-square:hover {
  background-color: rgba(0, 193, 255, 0.2);
  border-color: #00D1FF;
}
.custom-lives-input {
  width: 100%;
  max-width: 300px;
}
</style>
