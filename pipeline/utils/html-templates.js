/**
 * HTML Template Generators for HP Odonto Marketing Platform
 *
 * Produces clean, professional dental marketing visuals with:
 * - Gradient backgrounds, dental color schemes (blues, whites, clean lines)
 * - Typography hierarchy using Inter font
 * - CTA buttons with rounded corners
 * - Badge/label elements, decorative accent lines/shapes
 *
 * Supported templates:
 *   antes_depois, procedimento_destaque, educativo_infografico,
 *   centralizado_minimal, depoimento_visual, promocao_sazonal
 */

// ---------------------------------------------------------------------------
// Color palettes
// ---------------------------------------------------------------------------
const PALETTES = {
  primary: {
    gradient: 'linear-gradient(135deg, #0A6EBD 0%, #0E86D4 50%, #45B3E7 100%)',
    dark: '#0A4D8C',
    main: '#0A6EBD',
    light: '#45B3E7',
    accent: '#00D1A0',
    white: '#FFFFFF',
    offWhite: '#F0F7FF',
    text: '#1A1A2E',
    textLight: '#5A6A7E',
    overlay: 'rgba(10, 110, 189, 0.85)',
  },
  warm: {
    gradient: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)',
    dark: '#D94F4F',
    main: '#FF6B6B',
    light: '#FF8E53',
    accent: '#FFD93D',
  },
  clinical: {
    gradient: 'linear-gradient(135deg, #E8F4FD 0%, #FFFFFF 50%, #F0F7FF 100%)',
    dark: '#0A4D8C',
    main: '#0A6EBD',
    light: '#E8F4FD',
  },
};

// ---------------------------------------------------------------------------
// Base CSS shared by all ad templates
// ---------------------------------------------------------------------------
function generateAdCSS() {
  return `
    .ad-container {
      width: 1080px;
      height: 1080px;
      position: relative;
      overflow: hidden;
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      color: ${PALETTES.primary.text};
    }

    /* Gradient overlays */
    .bg-gradient-primary { background: ${PALETTES.primary.gradient}; }
    .bg-gradient-warm { background: ${PALETTES.warm.gradient}; }
    .bg-gradient-clinical { background: ${PALETTES.clinical.gradient}; }

    /* Typography */
    .headline {
      font-weight: 800;
      line-height: 1.1;
      letter-spacing: -0.02em;
    }
    .headline-lg { font-size: 64px; }
    .headline-md { font-size: 48px; }
    .headline-sm { font-size: 36px; }

    .subheadline {
      font-weight: 500;
      line-height: 1.4;
      font-size: 24px;
      color: ${PALETTES.primary.textLight};
    }

    .body-text {
      font-weight: 400;
      font-size: 20px;
      line-height: 1.6;
      color: ${PALETTES.primary.textLight};
    }

    /* CTA Button */
    .cta-button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 18px 48px;
      border-radius: 50px;
      font-weight: 700;
      font-size: 22px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      border: none;
      cursor: pointer;
      text-decoration: none;
    }
    .cta-primary {
      background: ${PALETTES.primary.accent};
      color: #FFFFFF;
      box-shadow: 0 8px 24px rgba(0, 209, 160, 0.35);
    }
    .cta-white {
      background: #FFFFFF;
      color: ${PALETTES.primary.main};
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    }

    /* Badge */
    .badge {
      display: inline-block;
      padding: 8px 20px;
      border-radius: 24px;
      font-weight: 600;
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }
    .badge-accent {
      background: ${PALETTES.primary.accent};
      color: #FFFFFF;
    }
    .badge-outline {
      background: transparent;
      border: 2px solid ${PALETTES.primary.main};
      color: ${PALETTES.primary.main};
    }
    .badge-white {
      background: rgba(255,255,255,0.2);
      color: #FFFFFF;
      backdrop-filter: blur(8px);
    }

    /* Accent line */
    .accent-line {
      width: 60px;
      height: 4px;
      border-radius: 2px;
      background: ${PALETTES.primary.accent};
    }

    /* Decorative circle */
    .deco-circle {
      position: absolute;
      border-radius: 50%;
      opacity: 0.08;
    }

    /* Logo placeholder */
    .logo-area {
      display: flex;
      align-items: center;
      gap: 12px;
      font-weight: 700;
      font-size: 20px;
    }
    .logo-icon {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 22px;
    }

    /* Card */
    .card {
      background: #FFFFFF;
      border-radius: 20px;
      padding: 32px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
    }

    /* Divider */
    .divider {
      width: 100%;
      height: 1px;
      background: rgba(0, 0, 0, 0.08);
    }
  `;
}

// ---------------------------------------------------------------------------
// Base CSS for carousel slides
// ---------------------------------------------------------------------------
function generateSlideCSS() {
  return `
    .slide-container {
      width: 1080px;
      height: 1080px;
      position: relative;
      overflow: hidden;
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      color: ${PALETTES.primary.text};
    }

    /* Slide backgrounds */
    .slide-bg-primary {
      background: ${PALETTES.primary.gradient};
      color: #FFFFFF;
    }
    .slide-bg-light {
      background: ${PALETTES.clinical.gradient};
    }
    .slide-bg-white {
      background: #FFFFFF;
    }

    /* Slide typography */
    .slide-title {
      font-weight: 800;
      font-size: 52px;
      line-height: 1.1;
      letter-spacing: -0.02em;
    }
    .slide-subtitle {
      font-weight: 600;
      font-size: 32px;
      line-height: 1.3;
    }
    .slide-body {
      font-weight: 400;
      font-size: 24px;
      line-height: 1.6;
    }
    .slide-number {
      font-weight: 800;
      font-size: 120px;
      opacity: 0.1;
      position: absolute;
      top: 40px;
      right: 60px;
      line-height: 1;
    }

    /* Progress dots */
    .slide-progress {
      display: flex;
      gap: 8px;
      align-items: center;
    }
    .progress-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.3);
    }
    .progress-dot.active {
      width: 32px;
      border-radius: 5px;
      background: #FFFFFF;
    }
    .progress-dot-dark {
      background: rgba(10, 110, 189, 0.2);
    }
    .progress-dot-dark.active {
      background: ${PALETTES.primary.main};
    }

    /* Slide CTA */
    .slide-cta {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 16px 40px;
      border-radius: 50px;
      font-weight: 700;
      font-size: 20px;
      letter-spacing: 0.03em;
    }

    /* Reuse ad utilities */
    .badge {
      display: inline-block;
      padding: 8px 20px;
      border-radius: 24px;
      font-weight: 600;
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }
    .accent-line {
      width: 60px;
      height: 4px;
      border-radius: 2px;
      background: ${PALETTES.primary.accent};
    }
    .deco-circle {
      position: absolute;
      border-radius: 50%;
      opacity: 0.08;
    }
    .card {
      background: #FFFFFF;
      border-radius: 20px;
      padding: 32px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
    }
  `;
}

// ---------------------------------------------------------------------------
// Template: antes_depois (Before & After)
// ---------------------------------------------------------------------------
function tpl_antes_depois(layout) {
  const {
    headline = 'Transforme Seu Sorriso',
    subheadline = 'Resultados reais dos nossos pacientes',
    cta_text = 'Agende Sua Avaliação',
    badge_text = 'Antes & Depois',
    clinic_name = 'Clínica Dental',
    before_label = 'ANTES',
    after_label = 'DEPOIS',
  } = layout;

  return `
    <div class="ad-container" style="background: #FFFFFF;">
      <!-- Decorative elements -->
      <div class="deco-circle" style="width: 400px; height: 400px; background: ${PALETTES.primary.main}; top: -100px; right: -100px;"></div>
      <div class="deco-circle" style="width: 200px; height: 200px; background: ${PALETTES.primary.accent}; bottom: 80px; left: -60px;"></div>

      <!-- Top bar -->
      <div style="position: absolute; top: 0; left: 0; right: 0; height: 6px; background: ${PALETTES.primary.gradient};"></div>

      <!-- Header -->
      <div style="padding: 60px 60px 0;">
        <div class="logo-area" style="margin-bottom: 32px;">
          <div class="logo-icon" style="background: ${PALETTES.primary.gradient}; color: #FFF;">&#x2B50;</div>
          <span style="color: ${PALETTES.primary.main};">${clinic_name}</span>
        </div>
        <span class="badge badge-accent">${badge_text}</span>
        <h1 class="headline headline-lg" style="margin-top: 20px;">${headline}</h1>
        <p class="subheadline" style="margin-top: 12px;">${subheadline}</p>
      </div>

      <!-- Before / After panels -->
      <div style="display: flex; gap: 24px; padding: 40px 60px;">
        <div style="flex: 1; border-radius: 20px; overflow: hidden; position: relative;">
          <div style="width: 100%; height: 380px; background: linear-gradient(135deg, #E0E0E0 0%, #C0C0C0 100%); display: flex; align-items: center; justify-content: center; border-radius: 20px;">
            <span style="font-size: 64px; opacity: 0.3;">&#x1F9B7;</span>
          </div>
          <div style="position: absolute; bottom: 16px; left: 16px; background: rgba(0,0,0,0.7); color: #FFF; padding: 8px 20px; border-radius: 20px; font-weight: 700; font-size: 14px; letter-spacing: 0.08em;">${before_label}</div>
        </div>
        <div style="flex: 1; border-radius: 20px; overflow: hidden; position: relative;">
          <div style="width: 100%; height: 380px; background: linear-gradient(135deg, ${PALETTES.primary.light} 0%, ${PALETTES.primary.main} 100%); display: flex; align-items: center; justify-content: center; border-radius: 20px;">
            <span style="font-size: 64px; opacity: 0.5;">&#x2728;</span>
          </div>
          <div style="position: absolute; bottom: 16px; left: 16px; background: ${PALETTES.primary.accent}; color: #FFF; padding: 8px 20px; border-radius: 20px; font-weight: 700; font-size: 14px; letter-spacing: 0.08em;">${after_label}</div>
        </div>
      </div>

      <!-- CTA -->
      <div style="padding: 0 60px; text-align: center;">
        <div class="cta-button cta-primary">${cta_text}</div>
      </div>
    </div>`;
}

// ---------------------------------------------------------------------------
// Template: procedimento_destaque (Procedure Highlight)
// ---------------------------------------------------------------------------
function tpl_procedimento_destaque(layout) {
  const {
    headline = 'Clareamento Dental',
    subheadline = 'Dentes até 8 tons mais brancos em apenas 1 sessão',
    cta_text = 'Saiba Mais',
    badge_text = 'Procedimento',
    description = 'Tecnologia LED de última geração para resultados seguros e duradouros.',
    features = ['Indolor', 'Resultado imediato', 'Sessão de 40 min'],
    clinic_name = 'Clínica Dental',
  } = layout;

  const featureItems = (features || []).map(f => `
    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
      <div style="width: 36px; height: 36px; border-radius: 50%; background: rgba(0,209,160,0.15); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
        <span style="color: ${PALETTES.primary.accent}; font-size: 18px;">&#x2713;</span>
      </div>
      <span style="font-size: 22px; font-weight: 500; color: #FFFFFF;">${f}</span>
    </div>
  `).join('');

  return `
    <div class="ad-container bg-gradient-primary" style="color: #FFFFFF;">
      <!-- Decorative -->
      <div class="deco-circle" style="width: 500px; height: 500px; background: #FFFFFF; bottom: -150px; right: -150px;"></div>
      <div class="deco-circle" style="width: 300px; height: 300px; background: #FFFFFF; top: -80px; left: -80px;"></div>

      <!-- Content -->
      <div style="padding: 80px 70px; position: relative; z-index: 1; height: 100%; display: flex; flex-direction: column;">
        <!-- Header -->
        <div>
          <div class="logo-area" style="margin-bottom: 40px; color: #FFFFFF;">
            <div class="logo-icon" style="background: rgba(255,255,255,0.2); color: #FFF; backdrop-filter: blur(8px);">&#x2B50;</div>
            <span>${clinic_name}</span>
          </div>
          <span class="badge badge-white">${badge_text}</span>
          <h1 class="headline headline-lg" style="margin-top: 24px; color: #FFFFFF;">${headline}</h1>
          <div class="accent-line" style="margin-top: 20px; background: ${PALETTES.primary.accent};"></div>
          <p style="margin-top: 20px; font-size: 26px; font-weight: 500; line-height: 1.4; color: rgba(255,255,255,0.9);">${subheadline}</p>
        </div>

        <!-- Description -->
        <p style="margin-top: 24px; font-size: 20px; line-height: 1.6; color: rgba(255,255,255,0.75);">${description}</p>

        <!-- Features -->
        <div style="margin-top: 40px; flex: 1;">
          ${featureItems}
        </div>

        <!-- CTA -->
        <div style="margin-top: auto;">
          <div class="cta-button cta-white">${cta_text}</div>
        </div>
      </div>
    </div>`;
}

// ---------------------------------------------------------------------------
// Template: educativo_infografico (Educational Infographic)
// ---------------------------------------------------------------------------
function tpl_educativo_infografico(layout) {
  const {
    headline = 'Cuide da Sua Saúde Bucal',
    subheadline = 'Dicas essenciais para um sorriso saudável',
    badge_text = 'Saúde Bucal',
    tips = [
      { icon: '&#x1F9F7;', title: 'Escove 3x ao dia', desc: 'Use escova macia e creme dental com flúor' },
      { icon: '&#x1FA77;', title: 'Use fio dental', desc: 'Diariamente antes de dormir' },
      { icon: '&#x1F4C5;', title: 'Visite o dentista', desc: 'A cada 6 meses para check-up' },
    ],
    clinic_name = 'Clínica Dental',
    cta_text = 'Agende Sua Consulta',
  } = layout;

  const tipCards = (tips || []).map((tip, i) => `
    <div class="card" style="display: flex; align-items: flex-start; gap: 20px; margin-bottom: 20px;">
      <div style="width: 64px; height: 64px; border-radius: 16px; background: ${PALETTES.primary.gradient}; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
        <span style="font-size: 28px; color: #FFF;">${tip.icon || (i + 1)}</span>
      </div>
      <div>
        <h3 style="font-size: 24px; font-weight: 700; margin-bottom: 6px; color: ${PALETTES.primary.text};">${tip.title}</h3>
        <p style="font-size: 18px; color: ${PALETTES.primary.textLight}; line-height: 1.4;">${tip.desc}</p>
      </div>
    </div>
  `).join('');

  return `
    <div class="ad-container" style="background: ${PALETTES.clinical.gradient};">
      <!-- Decorative -->
      <div class="deco-circle" style="width: 350px; height: 350px; background: ${PALETTES.primary.main}; top: -100px; right: -80px;"></div>

      <!-- Top accent bar -->
      <div style="position: absolute; top: 0; left: 0; right: 0; height: 6px; background: ${PALETTES.primary.gradient};"></div>

      <div style="padding: 60px 60px; height: 100%; display: flex; flex-direction: column;">
        <!-- Header -->
        <div style="margin-bottom: 16px;">
          <div class="logo-area" style="margin-bottom: 28px;">
            <div class="logo-icon" style="background: ${PALETTES.primary.gradient}; color: #FFF;">&#x2B50;</div>
            <span style="color: ${PALETTES.primary.main};">${clinic_name}</span>
          </div>
          <span class="badge badge-outline">${badge_text}</span>
          <h1 class="headline headline-md" style="margin-top: 16px;">${headline}</h1>
          <p class="subheadline" style="margin-top: 8px;">${subheadline}</p>
          <div class="accent-line" style="margin-top: 16px;"></div>
        </div>

        <!-- Tips -->
        <div style="flex: 1; display: flex; flex-direction: column; justify-content: center;">
          ${tipCards}
        </div>

        <!-- CTA -->
        <div style="text-align: center; margin-top: 16px;">
          <div class="cta-button cta-primary">${cta_text}</div>
        </div>
      </div>
    </div>`;
}

// ---------------------------------------------------------------------------
// Template: centralizado_minimal (Centered Minimal)
// ---------------------------------------------------------------------------
function tpl_centralizado_minimal(layout) {
  const {
    headline = 'Seu Sorriso Merece o Melhor',
    subheadline = 'Odontologia de excelência com tecnologia de ponta',
    cta_text = 'Agende Agora',
    clinic_name = 'Clínica Dental',
    badge_text = '',
  } = layout;

  return `
    <div class="ad-container" style="background: #FFFFFF; display: flex; align-items: center; justify-content: center; text-align: center;">
      <!-- Decorative -->
      <div class="deco-circle" style="width: 600px; height: 600px; background: ${PALETTES.primary.main}; top: 50%; left: 50%; transform: translate(-50%, -50%);"></div>
      <div style="position: absolute; top: 0; left: 0; right: 0; height: 4px; background: ${PALETTES.primary.gradient};"></div>
      <div style="position: absolute; bottom: 0; left: 0; right: 0; height: 4px; background: ${PALETTES.primary.gradient};"></div>

      <!-- Vertical accent lines -->
      <div style="position: absolute; left: 60px; top: 120px; bottom: 120px; width: 2px; background: linear-gradient(to bottom, transparent, ${PALETTES.primary.light}, transparent); opacity: 0.2;"></div>
      <div style="position: absolute; right: 60px; top: 120px; bottom: 120px; width: 2px; background: linear-gradient(to bottom, transparent, ${PALETTES.primary.light}, transparent); opacity: 0.2;"></div>

      <div style="position: relative; z-index: 1; padding: 80px;">
        <div class="logo-area" style="justify-content: center; margin-bottom: 48px;">
          <div class="logo-icon" style="background: ${PALETTES.primary.gradient}; color: #FFF;">&#x2B50;</div>
          <span style="color: ${PALETTES.primary.main};">${clinic_name}</span>
        </div>

        ${badge_text ? `<span class="badge badge-outline" style="margin-bottom: 24px;">${badge_text}</span>` : ''}

        <div class="accent-line" style="margin: 0 auto 32px;"></div>

        <h1 class="headline headline-lg" style="margin-bottom: 24px; max-width: 700px;">${headline}</h1>
        <p class="subheadline" style="margin-bottom: 48px; max-width: 600px; margin-left: auto; margin-right: auto;">${subheadline}</p>

        <div class="cta-button cta-primary">${cta_text}</div>
      </div>
    </div>`;
}

// ---------------------------------------------------------------------------
// Template: depoimento_visual (Testimonial Visual)
// ---------------------------------------------------------------------------
function tpl_depoimento_visual(layout) {
  const {
    headline = 'O Que Nossos Pacientes Dizem',
    testimonial = 'Mudou completamente minha autoestima. O atendimento foi impecável do início ao fim!',
    patient_name = 'Maria Silva',
    patient_detail = 'Paciente há 3 anos',
    rating = 5,
    cta_text = 'Transforme Seu Sorriso',
    clinic_name = 'Clínica Dental',
    badge_text = 'Depoimento',
  } = layout;

  const stars = '&#x2605;'.repeat(Math.min(rating || 5, 5));

  return `
    <div class="ad-container bg-gradient-primary" style="color: #FFFFFF;">
      <!-- Decorative -->
      <div class="deco-circle" style="width: 400px; height: 400px; background: #FFFFFF; top: -120px; left: -120px;"></div>
      <div class="deco-circle" style="width: 250px; height: 250px; background: #FFFFFF; bottom: -80px; right: -80px;"></div>

      <div style="padding: 80px 70px; position: relative; z-index: 1; height: 100%; display: flex; flex-direction: column;">
        <!-- Header -->
        <div>
          <div class="logo-area" style="margin-bottom: 36px; color: #FFFFFF;">
            <div class="logo-icon" style="background: rgba(255,255,255,0.2); color: #FFF;">&#x2B50;</div>
            <span>${clinic_name}</span>
          </div>
          <span class="badge badge-white">${badge_text}</span>
          <h2 class="headline headline-md" style="margin-top: 20px; color: #FFFFFF;">${headline}</h2>
        </div>

        <!-- Quote -->
        <div style="flex: 1; display: flex; flex-direction: column; justify-content: center;">
          <div style="font-size: 80px; line-height: 1; opacity: 0.3; margin-bottom: -20px;">&#x201C;</div>
          <p style="font-size: 32px; font-weight: 500; line-height: 1.5; color: #FFFFFF; margin-bottom: 32px;">${testimonial}</p>
          <div style="display: flex; align-items: center; gap: 16px;">
            <!-- Avatar placeholder -->
            <div style="width: 64px; height: 64px; border-radius: 50%; background: rgba(255,255,255,0.25); display: flex; align-items: center; justify-content: center; font-size: 28px;">&#x1F600;</div>
            <div>
              <div style="font-weight: 700; font-size: 22px;">${patient_name}</div>
              <div style="font-size: 16px; opacity: 0.75;">${patient_detail}</div>
              <div style="font-size: 20px; color: #FFD93D; margin-top: 4px;">${stars}</div>
            </div>
          </div>
        </div>

        <!-- CTA -->
        <div>
          <div class="cta-button cta-white">${cta_text}</div>
        </div>
      </div>
    </div>`;
}

// ---------------------------------------------------------------------------
// Template: promocao_sazonal (Seasonal Promotion)
// ---------------------------------------------------------------------------
function tpl_promocao_sazonal(layout) {
  const {
    headline = 'Promoção Especial',
    subheadline = 'Clareamento Dental com 30% OFF',
    cta_text = 'Garanta Sua Vaga',
    badge_text = 'Oferta Limitada',
    promo_value = '30% OFF',
    valid_until = 'Válido até 30/04',
    conditions = 'Consulte condições na clínica',
    clinic_name = 'Clínica Dental',
  } = layout;

  return `
    <div class="ad-container" style="background: #FFFFFF; position: relative;">
      <!-- Top gradient band -->
      <div style="position: absolute; top: 0; left: 0; right: 0; height: 420px; background: ${PALETTES.primary.gradient}; border-radius: 0 0 40px 40px;"></div>

      <!-- Decorative -->
      <div class="deco-circle" style="width: 300px; height: 300px; background: #FFFFFF; top: -80px; right: -60px;"></div>
      <div class="deco-circle" style="width: 200px; height: 200px; background: ${PALETTES.primary.accent}; bottom: 60px; left: -60px;"></div>

      <div style="position: relative; z-index: 1; padding: 60px 60px; height: 100%; display: flex; flex-direction: column;">
        <!-- Logo -->
        <div class="logo-area" style="margin-bottom: 32px; color: #FFFFFF;">
          <div class="logo-icon" style="background: rgba(255,255,255,0.2); color: #FFF;">&#x2B50;</div>
          <span>${clinic_name}</span>
        </div>

        <!-- Promo header (on blue) -->
        <div style="color: #FFFFFF;">
          <span class="badge badge-white">${badge_text}</span>
          <h1 class="headline headline-md" style="margin-top: 20px; color: #FFFFFF;">${headline}</h1>
          <p style="font-size: 24px; margin-top: 12px; color: rgba(255,255,255,0.85);">${subheadline}</p>
        </div>

        <!-- Promo value card -->
        <div style="margin-top: 40px;">
          <div class="card" style="text-align: center; padding: 48px 32px;">
            <div style="font-size: 72px; font-weight: 800; color: ${PALETTES.primary.main}; line-height: 1;">${promo_value}</div>
            <div class="accent-line" style="margin: 20px auto;"></div>
            <p style="font-size: 22px; color: ${PALETTES.primary.textLight}; margin-top: 12px;">${subheadline}</p>
            <p style="font-size: 16px; color: ${PALETTES.warm.main}; font-weight: 600; margin-top: 16px;">${valid_until}</p>
          </div>
        </div>

        <!-- CTA + conditions -->
        <div style="margin-top: auto; text-align: center;">
          <div class="cta-button cta-primary" style="margin-bottom: 16px;">${cta_text}</div>
          <p style="font-size: 14px; color: ${PALETTES.primary.textLight};">${conditions}</p>
        </div>
      </div>
    </div>`;
}

// ---------------------------------------------------------------------------
// Template registry
// ---------------------------------------------------------------------------
const TEMPLATES = {
  antes_depois: tpl_antes_depois,
  procedimento_destaque: tpl_procedimento_destaque,
  educativo_infografico: tpl_educativo_infografico,
  centralizado_minimal: tpl_centralizado_minimal,
  depoimento_visual: tpl_depoimento_visual,
  promocao_sazonal: tpl_promocao_sazonal,
};

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Generate ad HTML from a layout object.
 * layout.template selects the template; remaining keys are passed as params.
 */
function generateAdHTML(layout) {
  const templateName = layout.template || 'centralizado_minimal';
  const templateFn = TEMPLATES[templateName];

  if (!templateFn) {
    console.warn(`[html-templates] Unknown template "${templateName}", falling back to centralizado_minimal`);
    return TEMPLATES.centralizado_minimal(layout);
  }

  return templateFn(layout);
}

/**
 * Generate a single carousel slide HTML.
 */
function generateSlideHTML(slide, slideNumber, totalSlides) {
  const {
    title = '',
    body = '',
    type = 'content', // 'cover', 'content', 'cta'
    badge_text = '',
    cta_text = '',
    icon = '',
    clinic_name = 'Clínica Dental',
    items = [],
  } = slide;

  // Progress dots
  const dots = Array.from({ length: totalSlides }, (_, i) => {
    const isActive = i === slideNumber - 1;
    const bgClass = type === 'cover' ? '' : '-dark';
    return `<div class="progress-dot${bgClass} ${isActive ? 'active' : ''}" style="${
      type === 'cover'
        ? (isActive ? 'width: 32px; border-radius: 5px; background: #FFFFFF;' : 'background: rgba(255,255,255,0.3);')
        : (isActive ? `width: 32px; border-radius: 5px; background: ${PALETTES.primary.main};` : `background: rgba(10,110,189,0.2);`)
    }"></div>`;
  }).join('');

  if (type === 'cover') {
    return `
      <div class="slide-container slide-bg-primary" style="display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; color: #FFFFFF;">
        <div class="deco-circle" style="width: 500px; height: 500px; background: #FFFFFF; top: -150px; right: -150px;"></div>
        <div class="deco-circle" style="width: 300px; height: 300px; background: #FFFFFF; bottom: -100px; left: -100px;"></div>

        <div style="position: relative; z-index: 1; padding: 80px;">
          <div class="logo-area" style="justify-content: center; margin-bottom: 48px; color: #FFFFFF;">
            <div class="logo-icon" style="background: rgba(255,255,255,0.2); color: #FFF;">&#x2B50;</div>
            <span>${clinic_name}</span>
          </div>
          ${badge_text ? `<span class="badge" style="background: rgba(255,255,255,0.2); color: #FFF; margin-bottom: 24px;">${badge_text}</span>` : ''}
          <div class="accent-line" style="margin: 0 auto 32px; background: ${PALETTES.primary.accent};"></div>
          <h1 class="slide-title" style="color: #FFFFFF; margin-bottom: 20px;">${title}</h1>
          <p style="font-size: 26px; font-weight: 500; opacity: 0.85; max-width: 700px;">${body}</p>
        </div>

        <!-- Progress -->
        <div style="position: absolute; bottom: 48px; left: 50%; transform: translateX(-50%);">
          <div class="slide-progress">${dots}</div>
        </div>
      </div>`;
  }

  if (type === 'cta') {
    return `
      <div class="slide-container slide-bg-primary" style="display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; color: #FFFFFF;">
        <div class="deco-circle" style="width: 500px; height: 500px; background: #FFFFFF; top: -150px; left: -150px;"></div>

        <div style="position: relative; z-index: 1; padding: 80px;">
          <h1 class="slide-title" style="color: #FFFFFF; margin-bottom: 24px;">${title}</h1>
          <p style="font-size: 24px; opacity: 0.85; margin-bottom: 48px; max-width: 600px;">${body}</p>
          <div class="slide-cta" style="background: #FFFFFF; color: ${PALETTES.primary.main}; box-shadow: 0 8px 24px rgba(0,0,0,0.15);">${cta_text || 'Saiba Mais'}</div>

          <div class="logo-area" style="justify-content: center; margin-top: 64px; color: #FFFFFF; opacity: 0.7;">
            <div class="logo-icon" style="background: rgba(255,255,255,0.2); color: #FFF; width: 36px; height: 36px; font-size: 18px;">&#x2B50;</div>
            <span style="font-size: 18px;">${clinic_name}</span>
          </div>
        </div>

        <div style="position: absolute; bottom: 48px; left: 50%; transform: translateX(-50%);">
          <div class="slide-progress">${dots}</div>
        </div>
      </div>`;
  }

  // Default: content slide
  const itemsHTML = (items || []).map(item => `
    <div style="display: flex; align-items: flex-start; gap: 16px; margin-bottom: 20px;">
      <div style="width: 44px; height: 44px; border-radius: 12px; background: ${PALETTES.primary.gradient}; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
        <span style="color: #FFF; font-size: 20px;">${item.icon || '&#x2713;'}</span>
      </div>
      <div>
        <div style="font-weight: 700; font-size: 22px; color: ${PALETTES.primary.text};">${item.title || ''}</div>
        <div style="font-size: 18px; color: ${PALETTES.primary.textLight}; margin-top: 4px;">${item.desc || ''}</div>
      </div>
    </div>
  `).join('');

  return `
    <div class="slide-container slide-bg-light">
      <div class="deco-circle" style="width: 350px; height: 350px; background: ${PALETTES.primary.main}; top: -100px; right: -100px;"></div>
      <div class="slide-number" style="color: ${PALETTES.primary.main};">${String(slideNumber).padStart(2, '0')}</div>

      <div style="padding: 70px 70px; height: 100%; display: flex; flex-direction: column; position: relative; z-index: 1;">
        <!-- Header -->
        <div>
          ${badge_text ? `<span class="badge" style="background: ${PALETTES.primary.main}; color: #FFF; margin-bottom: 16px;">${badge_text}</span>` : ''}
          <h2 class="slide-title" style="margin-bottom: 12px;">${title}</h2>
          <div class="accent-line" style="margin-bottom: 20px;"></div>
          <p class="slide-body" style="color: ${PALETTES.primary.textLight};">${body}</p>
        </div>

        <!-- Items -->
        ${itemsHTML ? `<div style="margin-top: 40px; flex: 1;">${itemsHTML}</div>` : ''}

        <!-- Progress -->
        <div style="margin-top: auto;">
          <div class="slide-progress">${dots}</div>
        </div>
      </div>
    </div>`;
}

module.exports = {
  generateAdHTML,
  generateSlideHTML,
  generateAdCSS,
  generateSlideCSS,
  PALETTES,
  TEMPLATES,
};
