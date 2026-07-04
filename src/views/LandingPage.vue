<script setup>
import { onMounted, ref } from 'vue'
import SolicitacaoModal from '../components/SolicitacaoModal.vue'
import SuccessModal from '../components/SuccessModal.vue'

const isSolicitacaoModalOpen = ref(false)
const isSuccessModalOpen = ref(false)
const protocolo = ref('')
const parceiroRef = ref("SEM_REF")

onMounted(() => {
  const urlParams = new URLSearchParams(window.location.search)
  const refParam = urlParams.get("ref")

  if (refParam) {
    localStorage.setItem("ref_parceiro", refParam)
    parceiroRef.value = refParam
  } else {
    const storedRef = localStorage.getItem("ref_parceiro")
    if (storedRef) {
      parceiroRef.value = storedRef
    }
  }
})

const handleSolicitationSuccess = (p) => {
  isSolicitacaoModalOpen.value = false;
  protocolo.value = p;
  isSuccessModalOpen.value = true;
}
</script>

<template>
  <div class="landing-container">
    <!-- Efeitos de Fundo (Blobs) -->
    <div class="background-elements" aria-hidden="true">
      <div class="blob blob-1"></div>
      <div class="blob blob-2"></div>
      <div class="blob blob-3"></div>
    </div>

    <main class="glass-card fade-in">
      <!-- Header com Imagem de Fundo -->
      <div class="card-header-bg">
        <img src="/lp-header.jpg" alt="Família feliz" class="header-img" />
        <div class="header-overlay"></div>
        
        <div class="header-content">
          <!-- Badge de Destaque -->
          <div class="badge fade-in-delay-1">Destaque na Região</div>

          <!-- Headline Principal -->
          <h1 class="headline fade-in-delay-2">
            O plano de saúde ideal para seu perfil e suas necessidades.
          </h1>

          <!-- Subtítulo de Segmentação -->
          <p class="subheadline fade-in-delay-3">
            Encontre o plano de saúde ideal para você, para sua família, ou para sua empresa.
          </p>
        </div>
      </div>

      <div class="card-body">
        <!-- Único Botão CTA Principal -->
        <div class="cta-wrapper fade-in-delay-4">
          <button @click="isSolicitacaoModalOpen = true" class="cta-button quote-btn" aria-label="Faça sua solicitação">
            <span class="btn-text">Faça sua solicitação</span>
            <svg class="btn-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
            </svg>
          </button>
        </div>

        <SolicitacaoModal 
          :isOpen="isSolicitacaoModalOpen" 
          @close="isSolicitacaoModalOpen = false"
          @solicitation-success="handleSolicitationSuccess"
        />

        <SuccessModal 
          :isOpen="isSuccessModalOpen"
          :protocol="protocolo"
          @close="isSuccessModalOpen = false"
        />

        <!-- Lista de Benefícios Atualizada -->
        <ul class="benefits-list fade-in-delay-5">
          <li>
            <div class="icon-wrapper">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z" />
              </svg>
            </div>
            <span class="benefit-text">Planos com excelente custo-benefício</span>
          </li>
          <li>
            <div class="icon-wrapper">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
            </div>
            <span class="benefit-text">As melhores operadoras do mercado</span>
          </li>
          <li>
            <div class="icon-wrapper">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-9 14l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
            </div>
            <span class="benefit-text">Sem carência sob condições específicas</span>
          </li>
        </ul>

        <!-- Prova Social Atualizada -->
        <div class="social-proof-container fade-in-delay-6">
          <div class="social-proof-content">
            <div class="stars" aria-label="5 de 5 estrelas">
              <svg v-for="i in 5" :key="i" class="star" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16"
                height="16" fill="#FFC107">
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
              </svg>
            </div>
            <span class="proof-text">Mais de <strong class="highlight-text">1.500 clientes</strong> atendidos, com as principais operadoras do Brasil.</span>
          </div>
          
          <!-- Grid de Parceiros -->
          <div class="partners-grid">
            <img src="/amil.svg" alt="Amil" class="partner-logo" />
            <span class="partner-name">SulAmérica</span>
            <img src="/bradesco.svg" alt="Bradesco Saúde" class="partner-logo" />
            <img src="/portosaude.svg" alt="Porto Seguro Saúde" class="partner-logo" />
            <span class="partner-name">Intermédica</span>
            <img src="/unimed.svg" alt="Unimed" class="partner-logo" />
          </div>
        </div>

        <!-- Rodapé com Links Sociais e Disclaimer -->
        <footer class="footer-section fade-in-delay-7">
          <div class="social-links">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" class="social-link" aria-label="Siga-nos no Instagram">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
            </a>
          </div>
          <span class="footer-disclaimer">*Consultar condições</span>
        </footer>
      </div>
    </main>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');

.landing-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #050A18; /* Marinho muito escuro */
  font-family: 'Outfit', sans-serif;
  padding: 20px;
  color: #ffffff;
  box-sizing: border-box;
  position: relative;
  overflow: hidden;
  z-index: 1;
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
  filter: blur(80px);
  border-radius: 50%;
  opacity: 0.3;
  animation: float 20s infinite ease-in-out alternate;
}

.blob-1 { background: #003566; width: 400px; height: 400px; top: -100px; left: -100px; }
.blob-2 { background: #00A8E8; width: 300px; height: 300px; bottom: -50px; right: -50px; animation-delay: -5s; }

.glass-card {
  background: rgba(15, 23, 42, 0.95);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 32px;
  max-width: 420px;
  width: 100%;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.6);
  position: relative;
  z-index: 10;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* Header Background Styles */
.card-header-bg {
  position: relative;
  width: 100%;
  min-height: 240px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.header-img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.5;
}

.header-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(to bottom, rgba(15, 23, 42, 0.4), rgba(15, 23, 42, 1));
}

.header-content {
  position: relative;
  z-index: 2;
  padding: 32px 24px 10px;
  text-align: center;
}

.card-body {
  padding: 0 24px 32px;
  text-align: center;
}

.badge {
  display: inline-block;
  background: rgba(0, 209, 255, 0.2);
  color: #00D1FF;
  padding: 6px 14px;
  border-radius: 100px;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 1px;
  text-transform: uppercase;
  margin-bottom: 16px;
  border: 1px solid rgba(0, 209, 255, 0.3);
}

.headline {
  font-size: 32px;
  font-weight: 800;
  line-height: 1.1;
  margin-top: 0;
  margin-bottom: 12px;
  color: #ffffff;
  letter-spacing: -0.5px;
}

.highlight {
  color: #00D1FF;
}

.subheadline {
  font-size: 15px;
  font-weight: 500;
  line-height: 1.4;
  margin-bottom: 0;
  color: #CBD5E1;
  opacity: 0.9;
}

.cta-wrapper {
  margin-bottom: 24px;
  position: relative;
  z-index: 20;
}

.cta-button {
  background: #25D366 !important;
  color: #050A18 !important;
  border: none;
  border-radius: 16px;
  padding: 20px 24px;
  font-size: 20px;
  font-weight: 800;
  width: 100%;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  box-shadow: 0 8px 25px rgba(37, 211, 102, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.cta-button:hover:not(:disabled) {
  transform: scale(1.02);
  background: #22c35e !important;
}

.quote-btn {
  background: linear-gradient(135deg, #00D1FF 0%, #007BFF 100%) !important;
  color: white !important;
  margin-bottom: 12px;
  box-shadow: 0 8px 25px rgba(0, 123, 255, 0.3);
}

.quote-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #00E0FF 0%, #008BFF 100%) !important;
}

.cta-button.pulse {
  animation: pulse-soft 2s infinite;
}

@keyframes pulse-soft {
  0% { box-shadow: 0 0 0 0 rgba(37, 211, 102, 0.5); }
  70% { box-shadow: 0 0 0 15px rgba(37, 211, 102, 0); }
  100% { box-shadow: 0 0 0 0 rgba(37, 211, 102, 0); }
}

.benefits-list {
  list-style: none;
  padding: 0;
  margin: 0 0 28px 0;
  text-align: left;
}

.benefits-list li {
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  color: #E2E8F0;
  font-size: 14px;
  font-weight: 500;
}

.icon-wrapper {
  color: #00D1FF;
  background: rgba(0, 209, 255, 0.1);
  border-radius: 8px;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  flex-shrink: 0;
}

.social-proof-container {
  margin-bottom: 24px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.social-proof-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
}

.stars { display: flex; gap: 4px; }

.proof-text {
  font-size: 13px;
  color: #94A3B8;
  line-height: 1.4;
}

.highlight-text { color: #ffffff; font-weight: 700; }

.partners-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  align-items: center;
  justify-items: center;
  padding-top: 10px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.partner-logo {
  max-width: 60px;
  height: auto;
  filter: grayscale(1) brightness(2);
  opacity: 0.7;
  transition: all 0.3s ease;
}

.partner-logo:hover {
  filter: grayscale(0) brightness(1);
  opacity: 1;
}

.partner-name {
  font-size: 11px;
  font-weight: 700;
  color: #CBD5E1;
  opacity: 0.6;
}

/* Footer Section Styles */
.footer-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  margin-top: 10px;
}

.social-links {
  display: flex;
  gap: 16px;
  margin-bottom: 4px;
}

.social-link {
  color: #94A3B8;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.social-link:hover {
  color: #E1306C; /* Cor do Instagram no hover */
  transform: translateY(-2px);
}

.footer-disclaimer {
  font-size: 11px;
  color: #64748B;
}

/* Animações */
.fade-in { animation: fadeIn 0.6s ease-out forwards; }
[class*="fade-in-delay-"] { opacity: 0; animation: fadeIn 0.6s ease-out forwards; }
.fade-in-delay-1 { animation-delay: 0.1s; }
.fade-in-delay-2 { animation-delay: 0.2s; }
.fade-in-delay-3 { animation-delay: 0.3s; }
.fade-in-delay-4 { animation-delay: 0.4s; }
.fade-in-delay-5 { animation-delay: 0.5s; }
.fade-in-delay-6 { animation-delay: 0.6s; }
.fade-in-delay-7 { animation-delay: 0.7s; }

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes float {
  from { transform: translate(0, 0); }
  to { transform: translate(20px, -20px); }
}

@media (max-width: 360px) {
  .headline { font-size: 28px; }
  .card-header-bg { min-height: 200px; }
}
</style>
