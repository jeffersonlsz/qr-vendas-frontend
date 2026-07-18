<template>
  <div class="poster-container" ref="posterContainer">
    <!-- Seção de Cabeçalho / Imagem Herói -->
    <div class="hero-section">
      <img src="/lp-header.jpg" alt="Família feliz com seus pets" class="hero-image" />
      <div class="hero-fade"></div>
    </div>

    <!-- Conteúdo Principal do Cartaz -->
    <div class="main-content">
      
      <!-- Bloco de Títulos Principal -->
      <div class="headline-container">
        <span class="badge-economize">ECONOMIZE</span>
        <h1 class="headline-title">
          <span class="text-navy font-black">NO SEU PLANO</span>
          <span class="text-green font-black">DE SAÚDE</span>
        </h1>
      </div>

      <!-- Barra de Chamada de Simulação -->
      <div class="simulation-bar">
        <div class="simulation-icon-wrapper">
          <svg xmlns="http://www.w3.org/2000/svg" class="icon-clock" fill="none" viewBox="0 0 24 24" stroke="#10B981" stroke-width="2.5">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
        </div>
        <div class="simulation-text">
          <p class="main-sim-text">FAÇA UMA SIMULAÇÃO</p>
          <p class="sub-sim-text"><strong class="text-green">GRATUITA</strong> EM 1 MINUTO</p>
        </div>
      </div>

      <!-- Seção Central de Engajamento e Conversão (QR Code) -->
      <div class="qr-code-action-section">
        
        <!-- CTA Esquerda: Instrução de Escaneamento com Seta -->
        <div class="cta-side-wrapper left-alignment">
          <div class="arrow-container">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="curved-arrow">
              <path d="M21 3c0 6-4.5 11-11 11H4" />
              <polyline points="9 9 4 14 9 19"></polyline>
            </svg>
          </div>
          <p class="cta-instruction-text text-right">
            <span class="text-navy font-bold">APONTE</span><br>
            <span class="text-navy font-bold">A CÂMERA</span><br>
            <span class="text-green font-black">E ESCANEIE</span>
          </p>
        </div>

        <!-- QR Code Central -->
        <div class="qr-code-box-container">
          <canvas ref="qrCodeCanvas" class="qr-code-canvas"></canvas>
        </div>

        <!-- CTA Direita: Garantia de Velocidade e Segurança -->
        <div class="cta-side-wrapper right-alignment">
          <div class="phone-icon-container">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-phone-scan">
              <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
              <line x1="12" y1="18" x2="12.01" y2="18"></line>
              <path d="M9 6h6M9 10h6M9 14h6"></path>
            </svg>
          </div>
          <p class="cta-instruction-text text-left">
            <span class="text-navy font-black">É RÁPIDO</span><br>
            <span class="text-green font-black">E SEGURO</span>
          </p>
        </div>
      </div>

      <!-- Seção de Benefícios da Operadora (Movido para baixo do QR Code) -->
      <div class="benefits-grid-container">
        <div class="benefit-grid-item">
          <div class="benefit-icon-shield">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
          <p class="benefit-item-text">SEM<br>BUROCRACIA</p>
        </div>

        <div class="vertical-grid-divider"></div>

        <div class="benefit-grid-item">
          <div class="benefit-icon-shield">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          </div>
          <p class="benefit-item-text">PLANOS INDIVIDUAIS<br>E FAMILIARES</p>
        </div>

        <div class="vertical-grid-divider"></div>

        <div class="benefit-grid-item">
          <div class="benefit-icon-shield">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            </svg>
          </div>
          <p class="benefit-item-text">AS MELHORES<br>OPERADORAS</p>
        </div>
      </div>

      <!-- Selo de Identificação e Dados Credenciados do Parceiro -->
      <div class="partner-identity-card">
        <div class="partner-pane-left">
          <div class="pane-badge-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#1E2937" stroke-width="2" class="w-6 h-6">
              <circle cx="12" cy="8" r="6"></circle>
              <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"></path>
            </svg>
          </div>
          <div class="pane-details-content">
            <span class="pane-label-title">PARCEIRO CREDENCIADO:</span>
            <span class="pane-data-value">{{ partnerName }} - {{ partnerCode }}</span>
          </div>
        </div>

        <div class="partner-pane-right">
          <div class="pane-badge-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#1E2937" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6">
              <rect x="2" y="5" width="20" height="14" rx="2"></rect>
              <line x1="2" y1="10" x2="22" y2="10"></line>
            </svg>
          </div>
          <div class="pane-details-content">
            <span class="pane-label-title">CÓDIGO DO CARTÃO:</span>
            <span class="pane-data-value">{{ partnerId ? partnerId.slice(5).toUpperCase() : 'FCBC1D38' }}</span>
          </div>
        </div>
      </div>

    </div>

    <!-- Rodapé Visual com as Marcas das Operadoras -->
    <div class="footer-section">
      <p class="footer-brands-title">OPERADORAS PARCEIRAS:</p>
      <div class="brands-logos-flexrow">
        <img src="/unimed.svg" alt="Logo Unimed" class="brand-logo-item" />
        <div class="brand-item-divider"></div>
        <img src="/bradesco.svg" alt="Logo Bradesco" class="brand-logo-item image-contains-text" />
        <div class="brand-item-divider"></div>
        <img src="/amil.svg" alt="Logo Amil" class="brand-logo-item" />
      </div>
    </div>
  </div>
</template>

<script>
import QRCode from 'qrcode';
import { onMounted, ref, watch } from 'vue';

export default {
  name: 'CartazTemplate',
  props: {
    partnerName: {
      type: String,
      default: 'PARCEIRO 0002'
    },
    partnerCode: {
      type: String,
      default: 'CARD-000002'
    },
    qrCodeUrl: {
      type: String,
      default: 'https://google.com'
    },
    partnerId: {
      type: String,
      default: 'PROMPFCBC1D38'
    },
  },
  setup(props) {
    const qrCodeCanvas = ref(null);

    const generateQRCode = async () => {
      if (props.qrCodeUrl && qrCodeCanvas.value) {
        try {
          // Geração dinâmica calibrada para se adequar perfeitamente ao box central
          await QRCode.toCanvas(qrCodeCanvas.value, props.qrCodeUrl, {
            width: 170,
            margin: 1,
            color: { 
              dark: '#0F172A', // Tom marinho escuro combinando com a tipografia do cartaz
              light: '#FFFFFF' 
            },
            errorCorrectionLevel: 'H'
          });
        } catch (err) {
          console.error('Erro na renderização dinâmica do QRCode:', err);
        }
      }
    };

    onMounted(generateQRCode);
    watch(() => props.qrCodeUrl, generateQRCode, { immediate: true });

    return {
      qrCodeCanvas,
    };
  },
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Oswald:wght@700;900&family=Roboto:wght@400;500;700;900&display=swap');

/* Regras Globais do Canvas A4 de Impressão */
.poster-container {
  width: 210mm;
  height: 297mm;
  background-color: #FFFFFF;
  display: flex;
  flex-direction: column;
  font-family: 'Roboto', sans-serif;
  position: relative;
  overflow: hidden;
  box-sizing: border-box;
}

/* Seção de Cabeçalho Visual (Hero) */
.hero-section {
  width: 100%;
  height: 35%;
  position: relative;
  z-index: 1;
}

.hero-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center top;
}

.hero-fade {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 45%;
  background: linear-gradient(
    to bottom,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.4) 50%,
    rgba(255, 255, 255, 1) 100%
  );
}

/* Container de Conteúdo Dinâmico */
.main-content {
  padding: 0 45px;
  text-align: center;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
  z-index: 2;
  margin-top: -55px; /* Ajuste suave para encaixar a tipografia sobre o fade */
}

/* Nova Configuração da Headline */
.headline-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  margin-bottom: 5px;
}

.badge-economize {
  background-color: #10B981;
  color: #FFFFFF;
  font-family: 'Oswald', sans-serif;
  font-size: 1.5rem;
  font-weight: 900;
  padding: 2px 22px;
  border-radius: 6px;
  letter-spacing: 0.5px;
  display: inline-block;
}

.headline-title {
  font-family: 'Oswald', sans-serif;
  display: flex;
  flex-direction: column;
  line-height: 1.05;
  margin: 0;
}

.headline-title .text-navy {
  font-size: 3.4rem;
  color: #0F172A;
}

.headline-title .text-green {
  font-size: 4.8rem;
  color: #10B981;
}

/* Faixa/Barra de Atendimento e Simulação */
.simulation-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  margin: 5px auto;
}

.simulation-icon-wrapper .icon-clock {
  width: 36px;
  height: 36px;
}

.simulation-text {
  text-align: left;
  font-family: 'Roboto', sans-serif;
  line-height: 1.2;
}

.main-sim-text {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: #0F172A;
  letter-spacing: -0.2px;
}

.sub-sim-text {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: #0F172A;
  letter-spacing: -0.2px;
}

/* Área de Ação e Conversão (QR Code Centralizado) */
.qr-code-action-section {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 30px;
  margin: 10px 0;
}

.qr-code-box-container {
  background: #FFFFFF;
  padding: 10px;
  border-radius: 18px;
  border: 3px solid #10B981;
  display: flex;
  align-items: center;
  justify-content: center;
}

.qr-code-canvas {
  width: 170px !important;
  height: 170px !important;
  display: block;
}

.cta-side-wrapper {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}

.left-alignment {
  align-items: flex-end;
}

.right-alignment {
  align-items: flex-start;
}

.arrow-container .curved-arrow {
  width: 48px;
  height: 48px;
  transform: scaleX(-1) rotate(20deg); /* Curva e aponta visualmente para o box do QR code */
}

.phone-icon-container .icon-phone-scan {
  width: 42px;
  height: 42px;
}

.cta-instruction-text {
  margin: 0;
  font-size: 1.2rem;
  line-height: 1.15;
}

/* Bloco Horizontal de Benefícios (Em Colunas) */
.benefits-grid-container {
  display: flex;
  justify-content: space-around;
  align-items: center;
  margin: 10px 0;
  background: transparent;
}

.benefit-grid-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  flex: 1;
  max-width: 180px;
}

.benefit-icon-shield {
  width: 38px;
  height: 38px;
  background-color: #10B981;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.benefit-item-text {
  margin: 0;
  font-size: 0.85rem;
  color: #0F172A;
  font-weight: 700;
  line-height: 1.2;
  text-transform: uppercase;
}

.vertical-grid-divider {
  width: 1px;
  height: 45px;
  background-color: #E2E8F0;
}

/* Card Unificado de Credenciamento do Parceiro */
.partner-identity-card {
  background-color: #F8FAFC;
  border: 1px solid #E2E8F0;
  padding: 14px 24px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 5px;
}

.partner-pane-left,
.partner-pane-right {
  display: flex;
  align-items: center;
  gap: 14px;
  flex: 1;
}

.partner-pane-right {
  justify-content: flex-end;
  border-left: 1px solid #E2E8F0;
  padding-left: 24px;
}

.pane-badge-icon {
  color: #0F172A;
  display: flex;
  align-items: center;
}

.pane-details-content {
  display: flex;
  flex-direction: column;
  text-align: left;
}

.pane-label-title {
  font-size: 0.75rem;
  font-weight: 700;
  color: #64748B;
  letter-spacing: 0.2px;
}

.pane-data-value {
  font-size: 1.15rem;
  font-weight: 900;
  color: #0F172A;
  font-family: 'Roboto', sans-serif;
  margin-top: 1px;
}

/* Área de Rodapé (Marcas Comerciais) */
.footer-section {
  background-color: #FFFFFF;
  padding: 15px 45px 25px 45px;
  border-top: 1px solid #F1F5F9;
}

.footer-brands-title {
  text-align: center;
  font-size: 0.8rem;
  font-weight: 700;
  color: #94A3B8;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin: 0 0 14px 0;
}

.brands-logos-flexrow {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 35px;
}

.brand-logo-item {
  max-height: 28px;
  width: auto;
  object-fit: contain;
}

.brand-logo-item.image-contains-text {
  max-height: 32px; /* Pequena calibração visual de tamanho para a logo da Bradesco */
}

.brand-item-divider {
  width: 1px;
  height: 22px;
  background-color: #CBD5E1;
}

/* Classes Utilitárias de Texto */
.text-navy { color: #0F172A; }
.text-green { color: #10B981; }
.font-bold { font-weight: 700; }
.font-black { font-weight: 900; }
</style>