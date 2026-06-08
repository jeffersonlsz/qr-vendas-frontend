<template>
  <div class="landing-container">
    <div class="content-wrapper">
      <!-- 1. Headline -->
      <h1 class="headline">Plano de saúde mais barato da sua região</h1>

      <!-- 2. Subheadline -->
      <p class="subheadline">Atendimento rápido pelo WhatsApp. Sem burocracia.</p>

      <!-- 4. Benefícios -->
      <ul class="benefits-list">
        <li>
          <span class="icon">✅</span>
          Sem carência em alguns planos
        </li>
        <li>
          <span class="icon">✅</span>
          Atendimento imediato
        </li>
        <li>
          <span class="icon">✅</span>
          Planos a partir de R$ 99
        </li>
      </ul>

      <!-- 3. CTA principal -->
      <button class="cta-button primary" @click.prevent="handleClick" :disabled="isLoading">
        <span class="btn-text">{{ isLoading ? 'Aguarde...' : 'Falar com especialista agora' }}</span>
      </button>

      <!-- 5. Prova social -->
      <div class="social-proof">
        ⭐⭐⭐⭐⭐
        <p>Mais de <strong>1.000</strong> clientes atendidos</p>
      </div>

      <!-- 6. CTA secundário -->
      <button class="cta-button secondary" @click.prevent="handleClick" :disabled="isLoading">
        <span class="btn-text">Quero meu plano agora</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const isLoading = ref(false)
const telefoneWhatsapp = '5561999999999'

// 1. e 2. Capturar ref da URL e salvar no localStorage ao montar a página
onMounted(() => {
  const urlParams = new URLSearchParams(window.location.search)
  const refParam = urlParams.get('ref')

  if (refParam) {
    localStorage.setItem('ref_parceiro', refParam)
  }
})

// Função de criação de lead no backend
async function criarLead(parceiroId) {
  try {
    // Integração real com endpoint REST
    await fetch('http://127.0.0.1:8000/leads', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        parceiro_id: parceiroId,
        nome: 'Lead via QR',
        telefone: null,
        origem: 'qr_code'
      })
    })
  } catch (error) {
    console.error('Erro ao criar lead:', error)
  }
}

// Função principal de clique (TRACKING)
async function handleClick() {
  if (isLoading.value) return
  isLoading.value = true

  // 3. Recuperar ref
  const parceiroId = localStorage.getItem('ref_parceiro') || 'SEM_REF'

  // Evitar duplicação de leads verificando a chave
  const leadCriado = localStorage.getItem('lead_criado')

  // Condição para criar lead apenas se não existir
  if (!leadCriado) {
    // Aguarda a resposta (await) do backend antes de prosseguir
    await criarLead(parceiroId)
    // Marca como criado para evitar envios duplicados no mesmo navegador
    localStorage.setItem('lead_criado', 'true')
  }

  // Link dinâmico do WhatsApp estruturado com texto e origem paramentrizada
  const whatsappLink = `https://wa.me/${telefoneWhatsapp}?text=Ol%C3%A1%2C%20vim%20pelo%20QR%20${parceiroId}`

  isLoading.value = false

  // Abre o WhatsApp apenas após o request finalizar
  window.open(whatsappLink, '_blank')
}
</script>

<style scoped>
/* Fundo com gradiente azul e layout centralizado */
.landing-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #0A2540 0%, #0070F3 100%);
  padding: 20px;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  color: #ffffff;
}

.content-wrapper {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 24px;
  padding: 40px 24px;
  max-width: 420px;
  width: 100%;
  text-align: center;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2);
}

.headline {
  font-size: 28px;
  font-weight: 800;
  line-height: 1.2;
  margin-bottom: 12px;
  color: #ffffff;
}

.subheadline {
  font-size: 16px;
  font-weight: 400;
  line-height: 1.5;
  margin-bottom: 32px;
  color: #d1e8ff;
}

/* Espaçamento confortável e design limpo */
.benefits-list {
  list-style: none;
  padding: 0;
  margin: 0 0 32px 0;
  text-align: left;
}

.benefits-list li {
  font-size: 15px;
  margin-bottom: 14px;
  display: flex;
  align-items: center;
  color: #ffffff;
  font-weight: 500;
}

.benefits-list .icon {
  margin-right: 12px;
  font-size: 18px;
}

.cta-button {
  width: 100%;
  padding: 18px 24px;
  border-radius: 50px;
  border: none;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease;
}

.cta-button.pulse { animation: fadeIn 0.6s ease-out 0.4s forwards, pulse-soft 2s infinite 1s; }
.cta-button:hover.pulse { animation: fadeIn 0.6s ease-out 0.4s forwards; }

.cta-button:disabled {
  opacity: 0.7;
  cursor: wait;
  transform: none;
}

/* Botões verdes estilo WhatsApp */
.cta-button.primary {
  background: #25D366;
  color: #ffffff;
  box-shadow: 0 4px 20px rgba(37, 211, 102, 0.4);
  margin-bottom: 24px;
}

.cta-button.primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 25px rgba(37, 211, 102, 0.6);
  background: #20bd5a;
}

.cta-button.secondary {
  margin-bottom: 0; background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1); box-shadow: none;
  padding: 16px 24px; font-size: 16px;
  color: #ffffff;
}

.cta-button.secondary:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.1);
  border-color: #ffffff;
}

.social-proof {
  margin: 24px 0;
  font-size: 14px;
  color: #d1e8ff;
}

.social-proof p {
  margin: 8px 0 0 0;
  font-weight: 400;
}
</style>
