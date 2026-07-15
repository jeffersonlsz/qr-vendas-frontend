<template>
  <div class="poster-a4" ref="cartaz">
    <div class="hero-section">
      <img src="/lp-header.jpg" alt="Família feliz" class="hero-image" />
      <div class="hero-fade"></div>
    </div>

    <div class="main-content">
      <h1 class="headline">
        ECONOMIZE<br />
        NO SEU PLANO<br />
        DE SAÚDE
      </h1>

      <div class="highlight-bar">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.42 10.04c.08-.42.18-.83.18-1.24 0-1.85-.43-3.58-1.22-5.09a.36.36 0 0 0-.48-.25c-1.6.5-3.32.8-5.08.8-1.76 0-3.48-.3-5.09-.8a.36.36 0 0 0-.47.25C4.43 5.23 4 6.96 4 8.8c0 .4.1.82.18 1.24a.37.37 0 0 0 .37.33h12.5a.37.37 0 0 0 .37-.33zM7.34 18.15c.62.43 1.34.75 2.16.95.8.2 1.6.2 2.4.0.8-.2 1.54-.52 2.16-.95.3-.2.3-.5.05-.71l-1.12-1.3c-.22-.25-.58-.25-.8 0l-.6.6c-.25.25-.6.25-.85 0l-.6-.6c-.22-.25-.58-.25-.8 0l-1.12 1.3c-.25.2-.25.5.05.7zM20.57 14.5c.34-.7.6-1.46.75-2.25.15-.8.23-1.6.23-2.4 0-1.84-.43-3.58-1.22-5.09a.36.36 0 0 0-.48-.25c-1.6.5-3.32.8-5.08.8-1.76 0-3.48-.3-5.09-.8a.36.36 0 0 0-.47.25C4.43 5.23 4 6.96 4 8.8c0 .8.08 1.6.23 2.4.15.8.4 1.55.75 2.25.1.2.32.25.5.15l1.62-.9c.23-.13.52.05.52.3v1.65c0 .28.22.5.5.5h5.5c.28 0 .5-.22.5-.5V14c0-.25.3-.43.52-.3l1.62.9c.18.1.4.05.5-.15z" fill="white"></path></svg>
        <span>ATENDIMENTO RÁPIDO VIA WHATSAPP</span>
      </div>

      <div class="benefits-section">
        <div class="benefit-item">
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
          <p>Sem<br>burocracia</p>
        </div>
        <div class="benefit-item">
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
          <p>Planos individuais<br>e familiares</p>
        </div>
        <div class="benefit-item">
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
          <p>As melhores<br>operadoras</p>
        </div>
      </div>

      <div class="qr-main-section">
        <div class="qrcode-container">
          <canvas ref="qrcodeCanvas"></canvas>
        </div>
        <div class="cta-container">
          <div class="main-cta">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 4h4l2 5l-2.5 1.5a11 11 0 0 0 5 5l1.5-2.5l5 2v4a2 2 0 0 1-2 2a16 16 0 0 1-15-15a2 2 0 0 1 2-2"></path></svg>
            <span>ESCANEIE E FAÇA SUA COTAÇÃO GRATUITA</span>
          </div>
          <div class="partner-credential">
            <strong>PARCEIRO CREDENCIADO:</strong> {{ partnerName }} - {{ partnerCode }}
          </div>
          <div class="card-code">
            Código do Cartão: {{ partnerId.slice(5).toUpperCase() }}
          </div>
        </div>
      </div>

    </div>

    <div class="footer">
      <p class="footer-title">OPERADORAS PARCEIRAS</p>
      <div class="footer-logos">
        <img src="/unimed.svg" alt="Unimed Logo" />
        <img src="/bradesco.svg" alt="Bradesco Logo" />
        <img src="/amil.svg" alt="Amil Logo" />
        <img src="/portosaude.svg" alt="Porto Saúde Logo" />
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
    partnerName: String,
    partnerCode: String,
    qrCodeUrl: String,
    partnerId: String,
  },
  setup(props) {
    const qrcodeCanvas = ref(null);

    const generateQRCode = async () => {
      if (props.qrCodeUrl && qrcodeCanvas.value) {
        try {
          await QRCode.toCanvas(qrcodeCanvas.value, props.qrCodeUrl, {
            width: 250,
            margin: 1,
            color: { dark: '#111827', light: '#FFFFFF' },
            errorCorrectionLevel: 'H'
          });
        } catch (err) {
          console.error('Failed to generate QR Code:', err);
        }
      }
    };

    onMounted(generateQRCode);
    watch(() => props.qrCodeUrl, generateQRCode);

    return {
      qrcodeCanvas,
    };
  },
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Oswald:wght@700&family=Roboto:wght@400;500;700&display=swap');

.poster-a4 {
  width: 210mm;
  height: 297mm;
  background-color: #fafafa; /* Lighter background */
  display: flex;
  flex-direction: column;
  font-family: 'Roboto', sans-serif;
  position: relative;
  overflow: hidden;
}

.poster-a4::before {
  content: '';
  position: absolute;
  inset: 8mm;
  border: 2px solid #10B981; /* Lighter border */
  border-radius: 20mm; /* More rounded */
  z-index: 9999; /* Ensure it's above all other elements */
  pointer-events: none;
}

.hero-fade {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 30%;
  background:
    linear-gradient(
      to bottom,
      rgba(255,255,255,0) 0%,
      rgba(255,255,255,.15) 40%,
      rgba(255,255,255,.45) 65%,
      rgba(255,255,255,.80) 85%,
      rgba(255,255,255,1) 100%
    );
}

.hero-section {
  width: 100%;
  height: 38%; /* Approx 38% of A4 height */
  position: relative; /* Added for hero-fade positioning */
  z-index: 1; /* Ensure hero-section content is above pseudo-element */
}

.hero-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center top;
}

.main-content {
  padding: 0 40px 10px 40px; /* Added padding-bottom */
  text-align: center;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  position: relative; /* Ensure content is above hero-fade */
  z-index: 2; /* Ensure main content is above hero-fade */
  margin-top: -60px; /* Adjust as needed to pull headline closer to fade */
}

.headline {
  font-family: 'Oswald', sans-serif;
  font-size: 2.4rem; /* Smaller font size */
  line-height: 1; /* Tighter line height */
  text-transform: uppercase;
  color: #1F2937;
  margin: 0px 0 10px 0; /* Adjusted margin to move headline up */
  font-weight: 700;
}

.highlight-bar {
  background-color: #10B981; /* Main green color */
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 10px 0; /* Slightly reduced padding */
  border-radius: 8px;
  font-size: 1.1rem; /* Slightly smaller font */
  font-weight: 700;
  margin: 8px auto; /* Slightly reduced margin */
  width: 90%;
}

.benefits-section {
  display: flex;
  justify-content: space-around;
  margin: 18px 0; /* Reduced margin */
}

.benefit-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.benefit-item p {
  margin: 0;
  font-size: 0.95rem;
  color: #4B5563;
  font-weight: 500;
  line-height: 1.3;
}

.qr-main-section {
  display: flex;
  align-items: center;
  gap: 20px; /* Reduced gap */
  margin: 0 0 15px 0; /* Set margin-top to 0 and preserve bottom margin */
}

.qrcode-container {
  background: white;
  padding: 16px;
  border-radius: 24px; /* More rounded */
  box-shadow: 0 10px 30px rgba(0,0,0,.08); /* More premium shadow */
  border: none; /* Removed border */
}

.cta-container {
  display: flex;
  flex-direction: column;
  gap: 10px; /* Reduced gap */
  flex-grow: 1;
  text-align: left;
}

.main-cta {
  display: flex;
  align-items: center;
  gap: 10px; /* Reduced gap */
  font-size: 1.2rem; /* Slightly smaller font */
  font-weight: 600; /* Slightly lighter font weight */
  color: #111827;
}

.partner-credential {
  background-color: #E5E7EB;
  color: #374151;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 500;
}

.partner-credential strong {
  font-weight: 700;
}

.card-code {
  font-size: 0.8rem;
  color: #6B7280;
}

.footer {
  background-color: #FFFFFF;
  padding: 8px 40px 12px 40px;
  border-top: 1px solid #E5E7EB;
  margin-top: -6px;
}

.footer-title {
  text-align: center;
  font-size: 0.8rem;
  font-weight: 700;
  color: #6B7280;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin: 0; /* Removed margin-bottom */
}

.footer-logos {
  display: flex;
  justify-content: space-around;
  align-items: center;
}

.footer-logos img {
  max-height: 30px;
  width: auto;
  filter: grayscale(100%);
  opacity: 0.6;
}
</style>
