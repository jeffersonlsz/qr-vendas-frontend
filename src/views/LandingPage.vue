<template>
  <div class="landing-container">
    <div class="background-elements">
      <div class="blob blob-1"></div>
      <div class="blob blob-2"></div>
      <div class="blob blob-3"></div>
    </div>

    <div class="glass-card fade-in">
      <div class="badge fade-in-delay-1">Destaque na Região</div>
      <h1 class="headline fade-in-delay-2">O plano de saúde <span class="highlight">mais barato</span> da sua região
      </h1>
      <p class="subheadline fade-in-delay-3">Atendimento super-rápido pelo WhatsApp. <strong class="text-white">Zero
          burocracia.</strong></p>

      <button @click="handleAction" class="cta-button pulse fade-in-delay-4" :disabled="isLoading">
        <span class="btn-text">{{ isLoading ? 'Redirecionando...' : 'Falar com especialista agora' }}</span>
        <svg v-if="!isLoading" class="btn-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24"
          height="24" fill="currentColor">
          <path
            d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2ZM12.05 20.15C10.55 20.15 9.11 19.75 7.85 19L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 14.96 3.8 13.47 3.8 11.91C3.81 7.37 7.5 3.67 12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.05 20.15ZM16.58 13.91C16.33 13.79 15.11 13.18 14.88 13.1C14.66 13.02 14.5 12.98 14.33 13.23C14.16 13.48 13.69 14.05 13.54 14.21C13.4 14.38 13.25 14.4 13 14.28C12.75 14.15 11.96 13.89 11.02 13.05C10.29 12.39 9.8 11.58 9.65 11.33C9.5 11.08 9.63 10.95 9.76 10.82C9.87 10.71 10.01 10.53 10.13 10.39C10.26 10.24 10.3 10.14 10.43 9.94C10.55 9.74 10.49 9.57 10.43 9.45C10.36 9.32 9.87 8.12 9.66 7.64C9.46 7.18 9.25 7.24 9.11 7.24C8.98 7.24 8.81 7.24 8.64 7.24C8.48 7.24 8.21 7.3 7.98 7.55C7.75 7.8 7.11 8.39 7.11 9.59C7.11 10.79 8.01 11.95 8.14 12.12C8.28 12.28 9.84 14.68 12.21 15.71C12.78 15.95 13.22 16.1 13.56 16.21C14.13 16.39 14.65 16.36 15.06 16.29C15.52 16.21 16.51 15.68 16.71 15.09C16.92 14.5 16.92 14.01 16.86 13.91C16.79 13.81 16.62 13.74 16.58 13.91Z" />
        </svg>
      </button>

      <ul class="benefits-list fade-in-delay-5">
        <li>
          <div class="icon-wrapper">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
          </div>
          <span class="benefit-text">Sem carência em alguns planos</span>
        </li>
        <li>
          <div class="icon-wrapper">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path
                d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
            </svg>
          </div>
          <span class="benefit-text">Atendimento imediato</span>
        </li>
        <li>
          <div class="icon-wrapper">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path
                d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z" />
            </svg>
          </div>
          <span class="benefit-text">Planos a partir de R$ 99</span>
        </li>
      </ul>

      <div class="social-proof fade-in-delay-6">
        <div class="stars">
          <svg v-for="i in 5" :key="i" class="star" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20"
            height="20" fill="#FFC107">
            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
          </svg>
        </div>
        <span>Mais de <strong class="highlight-text">1.000 clientes</strong> atendidos</span>
      </div>

      <button @click="handleAction" class="cta-button secondary fade-in-delay-7" :disabled="isLoading">
        Quero meu plano agora
      </button>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'

const parceiroRef = ref("SEM_REF")
const isLoading = ref(false)

onMounted(() => {
  // 1. Capturar o parâmetro ref da URL
  const urlParams = new URLSearchParams(window.location.search)
  const refParam = urlParams.get("ref")

  if (refParam) {
    // 2. Salvar no localStorage
    localStorage.setItem("ref_parceiro", refParam)
    parceiroRef.value = refParam
  } else {
    // Tenta recuperar do localStorage caso não venha na URL
    const storedRef = localStorage.getItem("ref_parceiro")
    if (storedRef) {
      parceiroRef.value = storedRef
    }
  }
})

const getSessionId = () => {
  let sessionId = sessionStorage.getItem('lead_session_id');
  if (!sessionId) {
    // Fallback compatível caso rode localmente (ngrok http) onde randomUUID pode falhar fora de contexto seguro
    sessionId = typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : Date.now().toString(36) + Math.random().toString(36).substring(2);
    sessionStorage.setItem('lead_session_id', sessionId);
  }
  return sessionId;
};

const debugLog = (...args) => {
  if (import.meta.env.DEV) {
    console.debug('[LeadTracking]', ...args);
  }
};

const registrarLead = async (parceiroId) => {
  if (!parceiroId || parceiroId === "SEM_REF") {
    console.log('❌ parceiro inválido');
    return;
  }

  const sessionId = getSessionId();
  const dedupKey = `lead_${parceiroId}_${sessionId}`;

  if (localStorage.getItem(dedupKey)) {
    console.log('⚠️ já enviado nessa sessão');
    return;
  }

  const baseUrl = import.meta.env.VITE_API_URL;
  const endpoint = `${baseUrl}/api/v1/leads`;

  // 🔥 Payload compatível com o schema do backend
  const payload = {
    parceiro_id: parceiroId,
    nome: `Lead QR ${parceiroId}`,
    telefone: "0000000000", // placeholder válido (10 chars)
    origem: "qr_code",
    observacoes: "Lead gerado via clique no WhatsApp"
  };

  console.log("🔥 Enviando lead:", endpoint, payload);

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("❌ erro backend:", errorData);
      return;
    }

    console.log("✅ Lead criado com sucesso:", response.status);

    localStorage.setItem(dedupKey, "true");
  } catch (error) {
    console.error("❌ erro de rede:", error);
  }
};

const handleAction = async () => {
  if (isLoading.value) return;
  isLoading.value = true;

  const refValue = parceiroRef.value;

  // Aguarda a tentativa de envio
  await registrarLead(refValue);

  // Redirecionamento instantâneo (mantemos isLoading=true intencionalmente para não perder o feedback visual da UI durante o swap de página)
  const mensagem = encodeURIComponent(`Olá, vim pelo QR ${refValue}`);
  const whatsappLink = `https://wa.me/5561984974689?text=${mensagem}`;
  window.location.href = whatsappLink;
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');

.landing-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #0B132B;
  font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  padding: 24px;
  color: #ffffff;
  box-sizing: border-box;
  position: relative;
  overflow: hidden;
}

.background-elements {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}

.blob {
  position: absolute;
  filter: blur(90px);
  border-radius: 50%;
  opacity: 0.5;
  animation: float 20s infinite ease-in-out alternate;
}

.blob-1 {
  background: #1C3144;
  width: 500px;
  height: 500px;
  top: -150px;
  left: -150px;
}

.blob-2 {
  background: #007EA7;
  width: 400px;
  height: 400px;
  bottom: -100px;
  right: -100px;
  animation-delay: -5s;
}

.glass-card {
  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 32px;
  padding: 48px 32px;
  max-width: 480px;
  width: 100%;
  text-align: center;
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1);
  position: relative;
  z-index: 1;
}

.badge {
  display: inline-block;
  background: rgba(0, 168, 232, 0.15);
  color: #5ED5F4;
  padding: 8px 16px;
  border-radius: 100px;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  margin-bottom: 24px;
  border: 1px solid rgba(0, 168, 232, 0.3);
}

.headline {
  font-size: 38px;
  font-weight: 800;
  line-height: 1.15;
  margin-top: 0;
  margin-bottom: 16px;
  color: #ffffff;
  letter-spacing: -1px;
}

.highlight {
  background: linear-gradient(135deg, #00A8E8, #007EA7);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  display: inline-block;
}

.subheadline {
  font-size: 17px;
  font-weight: 400;
  line-height: 1.6;
  margin-bottom: 36px;
  color: #A0B4C4;
}

.text-white {
  color: #ffffff;
  font-weight: 600;
}

.cta-button {
  background: linear-gradient(135deg, #25D366, #128C7E);
  color: #ffffff;
  border: none;
  border-radius: 100px;
  padding: 20px 28px;
  font-size: 18px;
  font-weight: 700;
  width: 100%;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 10px 30px rgba(37, 211, 102, 0.3);
  margin-bottom: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.cta-button:hover:not(:disabled) {
  transform: translateY(-4px);
  box-shadow: 0 14px 40px rgba(37, 211, 102, 0.4);
}

.cta-button.pulse {
  animation: fadeIn 0.6s ease-out 0.4s forwards, pulse-soft 2s infinite 1s;
}

.cta-button:hover.pulse {
  animation: fadeIn 0.6s ease-out 0.4s forwards;
}

@keyframes pulse-soft {
  0% {
    box-shadow: 0 0 0 0 rgba(37, 211, 102, 0.5);
  }

  70% {
    box-shadow: 0 0 0 15px rgba(37, 211, 102, 0);
  }

  100% {
    box-shadow: 0 0 0 0 rgba(37, 211, 102, 0);
  }
}

.benefits-list {
  list-style: none;
  padding: 0;
  margin: 0 0 36px 0;
  text-align: left;
}

.benefits-list li {
  margin-bottom: 18px;
  display: flex;
  align-items: center;
  color: #E0E6ED;
  transition: transform 0.2s ease;
}

.benefits-list li:hover {
  transform: translateX(5px);
  color: #ffffff;
}

.icon-wrapper {
  color: #00A8E8;
  background: rgba(0, 168, 232, 0.1);
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  flex-shrink: 0;
}

.social-proof {
  margin-bottom: 28px;
  padding: 18px;
  background: rgba(0, 0, 0, 0.25);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.stars {
  display: flex;
  gap: 4px;
}

.social-proof span {
  font-size: 14px;
  color: #A0B4C4;
}

.highlight-text {
  color: #ffffff;
  font-weight: 700;
  font-size: 15px;
}

.cta-button.secondary {
  margin-bottom: 0;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: none;
  padding: 16px 24px;
  font-size: 16px;
}

.cta-button.secondary:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.1);
}

.fade-in {
  opacity: 0;
  animation: fadeIn 0.8s ease-out forwards;
}

[class*="fade-in-delay-"] {
  opacity: 0;
}

.fade-in-delay-1 {
  animation: fadeIn 0.6s ease-out 0.1s forwards;
}

.fade-in-delay-2 {
  animation: fadeIn 0.6s ease-out 0.2s forwards;
}

.fade-in-delay-3 {
  animation: fadeIn 0.6s ease-out 0.3s forwards;
}

.fade-in-delay-4 {
  animation: fadeIn 0.6s ease-out 0.4s forwards;
}

.fade-in-delay-5 {
  animation: fadeIn 0.6s ease-out 0.5s forwards;
}

.fade-in-delay-6 {
  animation: fadeIn 0.6s ease-out 0.6s forwards;
}

.fade-in-delay-7 {
  animation: fadeIn 0.6s ease-out 0.7s forwards;
}

@keyframes float {
  0% {
    transform: translate(0, 0) scale(1);
  }

  100% {
    transform: translate(30px, -50px) scale(1.1);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
