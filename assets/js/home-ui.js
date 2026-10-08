
/* ── FAQ accordion + FAQPage JSON-LD ── */
(function () {
  const list = document.getElementById('faqList');
  if (!list) return;

  function setOpen(item, open) {
    const btn = item.querySelector('.faq-trigger');
    const panel = item.querySelector('.faq-panel');
    if (!btn || !panel) return;
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open) {
      panel.removeAttribute('hidden');
      // Force reflow so grid-template-rows can animate from 0fr
      void panel.offsetHeight;
      item.classList.add('is-open');
    } else {
      item.classList.remove('is-open');
      const done = () => {
        if (!item.classList.contains('is-open')) panel.setAttribute('hidden', '');
        panel.removeEventListener('transitionend', done);
      };
      panel.addEventListener('transitionend', done);
      window.setTimeout(done, 320);
    }
  }

  list.querySelectorAll('.faq-item').forEach((item) => {
    const btn = item.querySelector('.faq-trigger');
    if (!btn) return;
    btn.addEventListener('click', () => {
      setOpen(item, !item.classList.contains('is-open'));
    });
  });

  // First item open by default: ensure panel not hidden
  const first = list.querySelector('.faq-item.is-open .faq-panel');
  if (first) first.removeAttribute('hidden');

  window.tukoSyncFaqJsonLd = function syncFaqJsonLd() {
    const items = list.querySelectorAll('.faq-item');
    const mainEntity = [];
    items.forEach((item) => {
      const qEl = item.querySelector('.faq-q');
      const aEl = item.querySelector('.faq-a');
      if (!qEl || !aEl) return;
      const name = (qEl.textContent || '').trim();
      const text = (aEl.textContent || '').trim();
      if (!name || !text) return;
      mainEntity.push({
        '@type': 'Question',
        name,
        acceptedAnswer: { '@type': 'Answer', text },
      });
    });
    if (!mainEntity.length) return;

    const origin = (location.origin || 'https://tukoteam.com').replace(/\/$/, '');
    const path = (location.pathname || '/').replace(/\/$/, '') || '';
    const pageUrl = origin + (path || '/') + (path.endsWith('/') || path === '' ? '' : '/');
    const idBase = origin + (path.indexOf('/en') === 0 ? '/en/' : '/') + '#faq';

    const payload = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      '@id': idBase,
      mainEntity,
    };

    let el = document.getElementById('tuko-faq-jsonld');
    if (!el) {
      el = document.createElement('script');
      el.type = 'application/ld+json';
      el.id = 'tuko-faq-jsonld';
      document.head.appendChild(el);
    }
    el.textContent = JSON.stringify(payload);
  };

  window.tukoSyncFaqJsonLd();
})();

/* ── TUKO i18n SYSTEM ── */
const translations = {
  es: {
    /* NAV */
    nav_link_problema: 'El problema',
    nav_link_como_funciona: 'Cómo funciona',
    nav_link_precios: 'Precios',
    nav_link_faq: 'Preguntas',
    nav_link_beneficios: 'Qué ganas',
    nav_link_blog: 'Blog',
    nav_cta: 'Instalar gratis',
    nav_lang_label: 'Idioma',
    /* TUKO AI */
    nav_link_ia: 'tuko AI',
    ia_status: 'En desarrollo',
    ia_lead: '<span class="ia-lead-brand">tuko AI</span> monta tus <span class="ia-lead-key">campañas</span> <em>por ti</em>: analiza tu tienda y tu mercado, y decide qué vender, a <span class="ia-lead-key">qué precio</span> y <span class="ia-lead-key">cuándo</span>.',
    ia_note: 'En desarrollo. Llegará dentro de Tuko.',
    ia_cta_primary: 'Entrar en la lista de espera',
    ia_cta_secondary: 'Ver cómo funciona Tuko',
    ia_signals_eyebrow: 'Qué analiza',
    ia_signals_title: 'Seis señales. Una campaña lista',
    ia_signals_sub: 'tuko AI cruza los datos de tu tienda con los de tu mercado para decidir qué producto poner en campaña, a qué precio y en qué momento.',
    ia_sig1_title: 'Tu mercado',
    ia_sig1_text: 'Demanda real de tu categoría, estacionalidad y hacia dónde se mueven los precios.',
    ia_sig2_title: 'Tu competencia',
    ia_sig2_text: 'Qué están lanzando, con qué descuentos y dónde hay un hueco que puedes ocupar.',
    ia_sig3_title: 'Tu calendario',
    ia_sig3_text: 'Campañas, fechas señaladas y los picos de tráfico en los que una campaña se llena sola.',
    ia_sig4_title: 'Tu localidad',
    ia_sig4_text: 'Dónde están tus compradores, para agrupar por zona y aprovechar el envío conjunto.',
    ia_sig5_title: 'Tus productos',
    ia_sig5_text: 'Márgenes, stock parado y qué referencias aguantan un descuento por volumen.',
    ia_sig6_title: 'Tus ventas',
    ia_sig6_text: 'Tu histórico y tus datos: qué se compra junto, cada cuánto y a qué precio convierte.',
    ia_flow_eyebrow: 'Cómo funcionará',
    ia_flow_title: 'De cero a campaña, sin estudio previo',
    ia_flow_sub: 'Hoy montar una campaña exige elegir producto, descuentos y mínimos a mano. tuko AI lo resuelve entero.',
    ia_step1_title: 'Conecta',
    ia_step1_text: 'Instalas Tuko en tu Shopify. tuko AI lee tu catálogo y tu histórico de ventas. No rellenas nada.',
    ia_step2_title: 'Propone',
    ia_step2_text: 'Recibes la campaña ya montada: qué producto, qué descuentos, cuántas unidades hacen falta y cuánto dura.',
    ia_step3_title: 'Aprende',
    ia_step3_text: 'Cada campaña completada la hace mejor: aprende del comportamiento de tus compradores y afina sola la siguiente campaña.',
    ia_final_title: 'Sé de los primeros en probarlo',
    ia_final_sub: 'tuko AI está en desarrollo. Déjanos tu correo y te avisamos en cuanto abramos el acceso anticipado.',
    ia_final_btn: 'Quiero acceso anticipado',
    ia_form_title: 'Únete a la lista de espera de tuko <span>AI</span>',
    ia_form_intro: 'Te avisamos en cuanto abramos el acceso anticipado. Sin spam.',
    ia_form_submit: 'Unirme a la lista de espera',
    ia_soon_tag: 'Pronto',
    ia_soon_text: 'También te dirá con qué creadores colaborar y por dónde crecer.',
    ia_wl_eyebrow: 'Lista de espera',
    ia_wl_count: '<b>39 marcas</b> ya están esperando su acceso',
    ia_wl_foot: 'Solo 50 tiendas entran en la beta privada.',
    fcta_eyebrow: 'Empieza hoy',
    fcta_title: 'Prueba una campaña<br><em>Si no vendes, no pagas</em>',
    fcta_sub: 'Instalar es gratis y el plan de entrada no tiene cuota: solo cobramos un porcentaje de lo que vendas con Tuko, con un tope máximo al mes.<br><br>Si un mes no lanzas ninguna campaña, pagas cero.',
    fcta_btn: 'Instalar gratis en Shopify',
    fcta_trust2: 'Sin cuota mensual',
    fcta_trust3: '+50 tiendas ya lo usan',
    fcta_shopify: 'Disponible en Shopify',

    /* HERO */
    hero_badge: 'Con el respaldo de Xiji Incubator',
    hero_title: 'El descuento que<br>te <em>trae clientes</em>, en vez de quitártelos',
    hero_subtitle: 'Pones un objetivo de unidades sobre un producto y un plazo. Tus clientes reservan sin que se les cobre nada.<span class="s-para-gap" aria-hidden="true"></span>Si se alcanza el objetivo, todos pagan el precio rebajado; si no, pagan el precio de siempre y tú no has regalado ni un euro de margen.',
    hero_cta: 'Instalar gratis en Shopify',
    hero_official: 'Sin cuota · Solo cobramos si vendes',
    hero_stat1_num: '+50',
    hero_stat1_lab: 'Tiendas usando Tuko',
    hero_stat2_num: '+30.000 €',
    hero_stat2_lab: 'Facturados en campañas Tuko',

    /* POPUP DEL PLUGIN */
    pop_chip: 'CAMPAÑA ACTIVA',
    pop_title: 'Faltan <b>10</b> unidades para bajar a <em>25,20 €</em>',
    pop_title_before: 'Faltan ',
    pop_title_people: 'unidades',
    pop_title_mid: ' para bajar a ',
    pop_title_deal: '25,20 €',
    pop_timer: 'Termina en',
    pop_days: 'Días',
    pop_hours: 'Horas',
    pop_minutes: 'Minutos',
    pop_seconds: 'Segundos',
    pop_product: 'Champú Natural',
    pop_joined: ' de 20 unidades reservadas',
    pop_cta: 'Bájalo a 25,20 €',
    pop_no_charge: 'No se te cobra nada hasta que termine la campaña.',
    pop_back_title: 'Así funciona una <em>campaña Tuko</em>',
    pop_back_sub: 'Cuantas más unidades se reservan, mayor es el descuento para todos.',
    pop_tier1: '10 unidades',
    pop_tier2: '20 unidades',
    pop_tier3: '35 unidades',
    pop_step1: 'Eliges un producto, un objetivo de unidades y un plazo.',
    pop_step2: 'Tus clientes reservan en tu checkout; se retiene el importe, sin cobro todavía.',
    pop_step3: 'Quien ya reservó comparte para llegar al objetivo.',
    pop_step4: 'Al cerrar, se cobra el precio del escalón alcanzado.',
    pop_step5: 'Si no se alcanza ningún escalón, pagan el precio normal.',
    pop_front_hint: 'Haz clic para voltear',
    pop_front_hint_tap: 'Toca para voltear',
    pop_back_foot: 'Haz clic para volver',
    pop_back_foot_tap: 'Toca para volver',

    /* VIDEO */
    video_title: 'Una campaña de <span class="video-brand">Tuko</span>, <em class="video-title-em">de principio a fin</em>',
    video_subtitle: 'Dos minutos: cómo se monta la campaña, qué ve tu cliente en la ficha de producto y qué pasa cuando se alcanza el objetivo.',

    /* LOGOS */
    logos_label: 'Con el apoyo de',
    logo_upm: 'Universidad Politécnica de Madrid',
    logo_xiji: 'Xiji Incubator',
    logo_ocea: 'OCEA HUB',
    logo_bio: 'Bio Vida Sana',
    logo_saper: 'Sáper Organic',

    /* PROBLEM */
    problem_badge: 'El problema',
    problem_title: 'Bajar el precio no es el problema.<br><span class="title-accent">Regalárselo</span> a quien ya iba a<br>comprar, <em class="title-accent-em">sí</em>',
    problem_sub: 'Cada rebaja plana se la llevan también los clientes que habrían comprado igual.<span class="s-para-gap" aria-hidden="true"></span>Estás pagando margen por ventas que ya tenías.',
    card1_title: 'Cada cliente nuevo te cuesta más',
    card1_text: 'El coste de captar un cliente en e-commerce ha subido más de un 200 % en una década.<span class="s-para-gap" aria-hidden="true"></span>Cada venta que traes con anuncios es más cara que la anterior.',
    card2_title: 'El stock parado se come el margen',
    card2_text: 'Rebajarlo un 30 % lo mueve, sí. Pero se lleva por delante el beneficio de todo el lote.<span class="s-para-gap" aria-hidden="true"></span>Y encima el descuento lo cobran también los clientes que ya lo iban a comprar.',
    card3_title: 'El descuento plano no se paga solo',
    card3_text: 'Un −20 % en un producto con 60 % de margen te obliga a vender un 67 % más unidades solo para quedarte igual.<span class="s-para-gap" aria-hidden="true"></span>Casi nunca pasa.',
    card1_source: 'Fuente: SimplicityDX, «The Customer Acquisition Crisis»',
    card2_source: 'Ejemplo ilustrativo de margen sobre una rebaja del 30 %',
    card3_source: 'Cálculo de umbral de rentabilidad (margen 60 %, descuento −20 %)',

    /* HOW IT WORKS */
    how_badge: 'Cómo funciona',
    how_title: 'Un descuento con condiciones.<br>Las <span class="how-title-underline">tuyas</span>',
    how_sub: 'Eliges un producto, un objetivo de unidades y un plazo.<span class="s-para-gap" aria-hidden="true"></span>El descuento no existe hasta que se cumple el objetivo.<span class="s-para-gap" aria-hidden="true"></span>Todo pasa dentro de tu tienda: el cliente no sale de tu web en ningún momento.',
    how_step1: 'Eliges producto y objetivo.',
    how_step2: 'Tus clientes reservan, como siempre.',
    how_step3: 'Ellos traen a los que faltan.',
    how_step4: 'Se cierra la campaña y se cobra.',

    /* HOW IT WORKS — STEPS */
    step1_title: 'Eliges producto y objetivo',
    step1_desc: 'Un producto, un objetivo de unidades y un plazo (72 horas funciona bien).<span class="s-para-gap" aria-hidden="true"></span>La escalera de descuentos la pones tú: no cedes ni un punto de margen más del que decidas.',
    step2_title: 'Tus clientes reservan, como siempre',
    step2_desc: 'Ven en la ficha cuántas unidades faltan para el siguiente precio y pasan por tu checkout de siempre, sin registrarse en ningún sitio y sin conocer a nadie.<span class="s-para-gap" aria-hidden="true"></span>Se les retiene el importe en la tarjeta, pero no se les cobra nada todavía.',
    step3_title: 'Ellos traen a los que faltan',
    step3_desc: 'A quien ya ha reservado le interesa que se llegue al objetivo, así que lo comparte.<span class="s-para-gap" aria-hidden="true"></span>Ese tráfico no lo has pagado tú.',
    step4_title: 'Se cierra la campaña y se cobra',
    step4_desc: 'Cuando termina el plazo, se cobra a todos el precio del escalón alcanzado.<span class="s-para-gap" aria-hidden="true"></span>Si no se alcanza ninguno, cada cliente paga el precio normal y la venta sigue siendo tuya.<span class="s-para-gap" aria-hidden="true"></span>Nunca pierdes una venta por intentarlo.',

    /* PRECIOS */
    pricing_badge: 'Precios',
    pricing_title: 'Solo ganamos si tú <em class="title-accent-em">vendes</em>',
    pricing_sub: 'Sin cuota de entrada y sin permanencia.<span class="s-para-gap" aria-hidden="true"></span>Cobramos un porcentaje de lo que vendas en campañas de Tuko, con un tope máximo al mes que apruebas tú antes de que se aplique nada.<span class="s-para-gap" aria-hidden="true"></span>Si un mes no lanzas ninguna campaña, tu factura es de cero euros.',
    pricing_per_month: '/mes',
    pricing_recommended: 'Recomendado',
    pricing_p1_name: 'Arranque',
    pricing_p1_price: '0 €',
    pricing_p1_comm: '+ 5 % de lo que vendas con Tuko',
    pricing_p1_f1: '1 campaña activa a la vez',
    pricing_p1_f2: 'Escalera de hasta 3 escalones',
    pricing_p1_f3: 'Widget en la ficha de producto',
    pricing_p1_f4: 'Analítica de campaña',
    pricing_p1_cap: 'Tope: 300 €/mes',
    pricing_p1_foot: 'Si no vendes, pagas 0 €.',
    pricing_p1_cta: 'Empezar gratis',
    pricing_p2_name: 'Crecimiento',
    pricing_p2_price: '49 €',
    pricing_p2_comm: '+ 2,5 % de lo que vendas con Tuko',
    pricing_p2_f1: 'Campañas ilimitadas y simultáneas',
    pricing_p2_f2: 'Pop-up inteligente',
    pricing_p2_f3: 'Test A/B de escaleras y textos',
    pricing_p2_f4: 'Objetivo en unidades o en personas',
    pricing_p2_f5: 'Soporte en 24 h',
    pricing_p2_cap: 'Tope: 700 €/mes',
    pricing_p2_foot: 'Te sale a cuenta a partir de 1.960 €/mes vendidos con Tuko.',
    pricing_p2_cta: 'Elegir plan',
    pricing_p3_name: 'Escala',
    pricing_p3_price: '149 €',
    pricing_p3_comm: '+ 1,2 % de lo que vendas con Tuko',
    pricing_p3_f1: 'Todo lo de Crecimiento',
    pricing_p3_f2: 'Tuko AI: objetivo y escalera sugeridos',
    pricing_p3_f3: 'Multitienda y multiidioma',
    pricing_p3_f4: 'Informe mensual de margen',
    pricing_p3_f5: 'Gestor de cuenta',
    pricing_p3_cap: 'Tope: 1.800 €/mes',
    pricing_p3_foot: 'Te sale a cuenta a partir de 7.700 €/mes vendidos con Tuko.',
    pricing_p3_cta: 'Elegir plan',
    pricing_p4_name: 'Enterprise',
    pricing_p4_price: 'A medida',
    pricing_p4_comm: 'Comisión y tope negociados',
    pricing_p4_f1: 'Varias tiendas o varios mercados',
    pricing_p4_f2: 'Integraciones a medida',
    pricing_p4_f3: 'Acuerdo de nivel de servicio',
    pricing_p4_f4: 'Acompañamiento en cada campaña',
    pricing_p4_foot: 'Hablamos y lo ajustamos a tu volumen.',
    pricing_p4_cta: 'Hablamos',
    pricing_legal: 'El porcentaje se calcula solo sobre lo vendido en campañas de Tuko, nunca sobre el resto de tu facturación. El tope es el máximo que puedes pagar en un mes y lo apruebas tú desde Shopify antes de que se aplique ningún cargo.',
    pricing_link_calc: '¿Cuánto tendrías que vender para que te compense? Haz el cálculo →',
    pricing_link_faq: '¿Te quedan dudas? Mira las preguntas frecuentes →',

    /* FAQ */
    faq_badge: 'Preguntas frecuentes',
    faq_title: 'Lo que nos preguntan <em class="title-accent-em">siempre</em>',
    faq_sub: 'Objeciones reales de las llamadas, respondidas por escrito para quien nunca va a llamar.',
    faq_q1: '¿Cuándo se le cobra a mi cliente?',
    faq_a1: 'Solo al cerrarse la campaña. Al pasar por el checkout se le retiene el importe del precio normal en la tarjeta, pero no hay ningún cargo: el dinero sigue en su cuenta. Cuando termina el plazo o se completa el objetivo, se le cobra una sola vez, con el descuento del escalón alcanzado ya aplicado.',
    faq_q2: '¿Mis clientes tienen que comprar con desconocidos?',
    faq_a2: 'No. Nadie se une a nada ni conoce a nadie. Cada cliente reserva por su cuenta, en tu checkout de siempre. Lo único que cambia es que ve cuántas unidades faltan para que baje el precio.',
    faq_q3: '¿Y si no se alcanza el objetivo?',
    faq_a3: 'Se cobra el precio normal, el mismo que tu cliente ya había aceptado al reservar. La venta sigue siendo tuya y tú no has cedido margen. Nunca pierdes una venta por intentarlo.',
    faq_q4: '¿Esto no me destroza el margen?',
    faq_a4: 'Al revés que una rebaja plana: el descuento no existe hasta que llega el volumen que lo paga. Tú fijas el descuento máximo y Tuko te avisa antes de publicar si un escalón se come tu margen.',
    faq_q5: '¿Esto es como Groupon?',
    faq_a5: 'No. Groupon te traía cazadores de ofertas de su lista, se quedaba una parte grande de cada venta y esos clientes no volvían. Con Tuko todo pasa dentro de tu tienda, con tus clientes y en tu base de datos, y el descuento solo aparece si te han traído ventas nuevas.',
    faq_q6: 'Ya uso una app de descuentos por volumen. ¿Para qué quiero esta?',
    faq_a6: 'Esa hace que un cliente compre tres unidades. Tuko hace que tres clientes compren una. Son complementarias: una sube el ticket, la otra trae compradores.',
    faq_q7: '¿Y si mis clientes no comparten nada?',
    faq_a7: 'La primera ola de una campaña no viene de tráfico frío: viene de tu lista de correo y de tus redes, que ya te leen. Compartir es lo que acelera, no lo que arranca. Y el primer escalón se diseña para que compense de verdad hacerlo.',
    faq_q8: '¿Cuánto cuesta?',
    faq_a8: 'Instalar es gratis y no hay cuota mensual en el plan de entrada. Solo cobramos un porcentaje de lo que vendas en campañas de Tuko, con un tope máximo al mes que ves y apruebas antes de que se aplique nada. Si un mes no lanzas ninguna campaña, pagas cero.',

    /* MOCKUP */
    mockup_product_name: 'Set de cremas',
    mockup_reviews: '4.7 (179 reviews)',
    mockup_price_old: '€61.99',
    mockup_price_new: '€54.99',
    mockup_btn_cart: 'Añadir al Carrito',
    mockup_btn_join: 'Unirse al Grupo',
    mockup_tip_label: 'Nueva opción',
    mockup_tip_text: 'Permite que los clientes reserven en una campaña',

    /* BENEFITS */
    benefits_badge: 'Qué ganas',
    benefits_title: 'Un descuento por volumen hace que un cliente compre tres unidades. <span class="title-accent">Tuko</span> hace que <em class="title-accent-em">tres clientes</em> compren una',
    benefits_sub: 'No es una app de descuentos más.<span class="s-para-gap" aria-hidden="true"></span>Es la única que usa el descuento para traerte compradores que no tenías.',
    ben1_title: 'Más unidades por campaña',
    ben1_text: 'El mismo producto y la misma semana, vendiendo el doble o el triple de unidades.<span class="s-para-gap" aria-hidden="true"></span>Sin subir un euro el presupuesto de anuncios.',
    ben2_title: 'Stock parado, fuera',
    ben2_text: 'Convierte la rebaja que ibas a hacer de todas formas en una venta condicionada al volumen.<span class="s-para-gap" aria-hidden="true"></span>Liberas capital sin regalar margen.',
    ben3_title: 'Tú decides el suelo',
    ben3_text: 'Defines la escalera y el descuento máximo.<span class="s-para-gap" aria-hidden="true"></span>Tuko te avisa si un escalón se come tu margen antes de publicar la campaña.',
    ben4_title: 'Compradores que no has pagado',
    ben4_text: 'Cada cliente que ya ha reservado tiene un motivo económico para compartirlo.<span class="s-para-gap" aria-hidden="true"></span>Ese tráfico te cuesta cero.',
    ben5_title: 'Instalado en dos minutos',
    ben5_text: 'App nativa de Shopify. Se añade a la ficha de producto sin tocar el tema ni el checkout.',
    ben6_title: 'Ni devoluciones ni ajustes a mano',
    ben6_text: 'A tus clientes se les retiene el importe al reservar y se les cobra una sola vez al cerrar la campaña, con el descuento ya aplicado.<span class="s-para-gap" aria-hidden="true"></span>Sin cobros parciales ni devoluciones que gestionar.',

    /* CTA */
    cta_title: 'Activa Tuko en tu tienda y convierte el tráfico en ventas reales.',
    cta_label_email: 'Email',
    cta_placeholder_email: 'Tu email',
    cta_label_name: 'Nombre',
    cta_placeholder_name: 'Tu nombre',
    cta_label_business: 'Nombre de negocio',
    cta_placeholder_business: 'Nombre de tu negocio',
    cta_label_phone: 'Teléfono móvil (opcional)',
    cta_placeholder_phone: 'Tu móvil (máx. 20 caracteres)',
    cta_label_details: 'Descripción o detalles (opcional)',
    cta_placeholder_details: 'Breve mensaje (máx. 100 caracteres)',
    cta_submit: 'Contactar',
    cta_success: '¡Mensaje enviado! Te contactaremos pronto.',
    cta_error: 'Ha ocurrido un error. Por favor escríbenos a team.tukoo@gmail.com',

    /* FOOTER */
    footer_col1_title: 'Contacto',
    footer_email: 'team.tukoo@gmail.com',
    footer_col_product: 'Producto',
    footer_pricing: 'Precios',
    footer_col2_title: 'Legales',
    footer_privacy: 'Política de privacidad',
    footer_terms: 'Términos y condiciones',
    footer_tagline: 'Descuentos por objetivo para tiendas Shopify. Vende más unidades sin regalar margen.',
    footer_copy: '© 2026 Tuko. Todos los derechos reservados.',

    /* BLOG INDEX */
    blog_badge: 'Recursos',
    blog_title: 'Blog',
    blog_subtitle: 'Casos de uso, novedades y estrategias de compra colectiva.',
    blog_categories: 'Categorías',
    blog_cat_all: 'Todos los artículos',
    blog_sort: 'Ordenar por',
    blog_sort_new: 'Más recientes primero',
    blog_sort_old: 'Más antiguos primero',
    blog_sort_short: 'Lectura más corta',
    blog_sort_az: 'Título A–Z',
    blog_count: 'artículos',
    blog_read: 'Leer artículo',
    blog_empty: 'No hay artículos en esta categoría todavía.',
    blog_post1_title: 'NATRUE y el futuro del comercio colaborativo',
    blog_post1_meta: '17 mar 2026 · Equipo Tuko',
    blog_post2_title: 'Un gran paso para Tuko 🇪🇸🇨🇭',
    blog_post2_meta: '19 feb 2026 · Equipo Tuko',
    blog_post3_title: 'New Formulas. Presentando Tuko en Shanghái 🇨🇳',
    blog_post3_meta: '14 nov 2025 · Equipo Tuko',
    blog_post4_title: 'OCEA HUB Presentando Tuko en Shanghái 🇨🇳',
    blog_post4_meta: '20 oct 2025 · Equipo Tuko',
    blog_post5_title: 'Spain Innovation Day Shanghái 🇪🇸🇨🇳',
    blog_post5_meta: '30 sep 2025 · Equipo Tuko',
    blog_post6_title: 'S-Tron Tech Trek Experience Shanghái 🇨🇳',
    blog_post6_meta: '23 sep 2025 · Equipo Tuko',
    blog_post7_title: 'Comenzando nuestro camino en Xiji Incubator Shanghái 🇨🇳',
    blog_post7_meta: '10 sep 2025 · Equipo Tuko',
    blog_ver_mas: 'Ver más',

    /* ARTICLE COMMON */
    article_back: '← Volver al blog',

    /* ARTICLE: shiji-incubator */
    shiji_meta: '10 sept 2025 · Equipo Tuko',
    shiji_title: 'Comenzando nuestro camino en Xiji Incubator Shanghái 🇨🇳',
    shiji_p1: 'Hace unas semanas llegamos a Shanghái para comenzar un nuevo capítulo de Tuko.',
    shiji_p2: 'Durante los próximos meses formaremos parte de Xiji Incubator, un programa internacional de startups con sede en la Universidad de Tongji, diseñado para ayudar a fundadores en etapas tempranas a construir y escalar startups globales.',
    shiji_p3: 'Esta oportunidad nos permite trabajar desde uno de los ecosistemas emprendedores más dinámicos del mundo mientras seguimos desarrollando la visión detrás de Tuko.',
    shiji_p4: 'Y sinceramente, se siente como el lugar perfecto para hacerlo.',
    shiji_h2_1: '¿Por qué Shanghái?',
    shiji_p5: 'Shanghái es uno de los lugares más emocionantes del planeta para construir tecnología.',
    shiji_p6: 'Por todas partes hay startups, inversores, nuevos productos y personas ambiciosas intentando construir algo grande. La velocidad a la que se crean empresas aquí es algo que notas inmediatamente.',
    shiji_p7: 'China ya ha demostrado al mundo lo poderosos que pueden ser los modelos de compra colectiva. Plataformas como Pinduoduo han transformado la forma en que millones de personas compran productos online convirtiendo las compras en una experiencia social.',
    shiji_p8: 'Estar aquí nos brinda la oportunidad de entender estos modelos mucho más profundamente y aprender directamente del ecosistema donde muchos de ellos nacieron.',
    shiji_h2_2: '¿Qué estamos construyendo?',
    shiji_p9: 'Tuko se basa en una idea simple: cuando la gente compra junta, todos deberían pagar menos. Nuestra plataforma permite a los usuarios unirse a compras grupales que desbloquean mejores descuentos cuanta más gente participa.',
    shiji_p10: 'Al mismo tiempo, las marcas se benefician vendiendo mayores volúmenes mientras reducen los costes de adquisición de clientes.',
    shiji_h2_3: '¿Qué viene después?',
    shiji_p11: 'Durante el programa nos centraremos en mejorar nuestro MVP, probar el concepto con usuarios y marcas, y aprender todo lo posible del ecosistema que nos rodea.',
    shiji_p12: '¡VAMOS A HACERLO!',

    /* ARTICLE: stron-tech-trek */
    stron_meta: '23 sept 2025 · Equipo Tuko',
    stron_title: 'S-Tron Tech Trek Experience Shanghái 🇨🇳',
    stron_p1: 'La semana pasada fuimos invitados a asistir al S-Tron Shanghai Tech Trek en el West Bund Art Center, un evento de innovación conectado al ecosistema de Xiji Incubator que reúne a fundadores, inversores y empresas tecnológicas.',
    stron_h2_1: 'Construyendo conexiones',
    stron_p2: 'Más allá de las charlas y demos de startups, la parte más valiosa fue la oportunidad de conocer a inversores de capital riesgo, fundadores y líderes de innovación de diferentes industrias. Eventos como este crean el entorno perfecto para intercambiar ideas, explorar colaboraciones y construir relaciones dentro del ecosistema tecnológico de Shanghái.',
    stron_h2_2: '¿Qué estamos construyendo?',
    stron_p3: 'Tuko se basa en una idea simple: cuando la gente compra junta, todos deberían pagar menos. Nuestra plataforma permite a los usuarios unirse a compras grupales que desbloquean mejores descuentos cuanta más gente participa.',
    stron_p4: 'Al mismo tiempo, las marcas se benefician vendiendo mayores volúmenes mientras reducen los costes de adquisición de clientes.',
    stron_h2_3: '¿Qué nos llevamos?',
    stron_p5: 'Experiencias como S-Tron muestran lo poderoso que es el ecosistema de innovación en Shanghái. Poder conectar con personas que construyen e invierten en tecnología es increíblemente valioso mientras seguimos desarrollando Tuko.',
    stron_p6: 'Sigamos construyendo.',

    /* ARTICLE: natrue-x-tuko */
    natrue_title: 'NATRUE y el futuro del comercio colaborativo',
    natrue_h2_1: 'El auge de la cosmética natural y orgánica',
    natrue_p1: 'El mercado de la cosmética está experimentando una importante transformación. Cada vez más consumidores buscan productos elaborados con ingredientes naturales, procesos responsables y una mayor transparencia sobre su composición y elaboración.',
    natrue_p2: 'Este cambio en los hábitos de consumo ha impulsado el crecimiento de la cosmética natural y orgánica. Al mismo tiempo, ha llevado a muchas marcas a prestar una atención especial a la calidad y el origen de sus ingredientes, la sostenibilidad de sus procesos y la confianza que transmiten a sus clientes.',
    natrue_p3: 'En este contexto, los estándares y las certificaciones independientes desempeñan un papel fundamental, ya que ayudan a los consumidores a identificar productos que cumplen criterios definidos y verificables.',
    natrue_h2_2: '¿Qué es NATRUE?',
    natrue_p4: 'NATRUE es una asociación internacional sin ánimo de lucro con sede en Bruselas, fundada en 2007 con el objetivo de promover y proteger la cosmética natural y orgánica en todo el mundo.',
    natrue_p5: 'A través de su estándar internacional, NATRUE establece criterios estrictos relacionados con los ingredientes utilizados, los procesos de transformación permitidos y la composición de los productos cosméticos.',
    natrue_p6: 'El sello NATRUE permite certificar los productos cosméticos terminados en dos niveles:',
    natrue_li1: 'Cosmética natural.',
    natrue_li2: 'Cosmética orgánica.',
    natrue_p7: 'Para obtener la certificación, los productos deben superar un proceso de evaluación realizado por organismos certificadores independientes y autorizados. De esta manera, el sello ayuda a consumidores, marcas y fabricantes a reconocer productos que cumplen los requisitos establecidos por el estándar NATRUE.',
    natrue_p8: 'Además, NATRUE adapta sus criterios a diferentes categorías de productos cosméticos, teniendo en cuenta que la formulación y las características de un champú, una crema, un maquillaje o un aceite pueden ser muy distintas.',
    natrue_h2_3: 'La importancia de la transparencia y la confianza',
    natrue_p9: 'En un mercado en el que existe una oferta cada vez mayor de productos que se presentan como naturales u orgánicos, disponer de criterios claros y verificables resulta especialmente importante.',
    natrue_p10: 'Los estándares independientes contribuyen a ofrecer una mayor transparencia sobre la composición de los productos y ayudan a reducir la confusión entre los consumidores.',
    natrue_p11: 'Organizaciones como NATRUE cumplen una función relevante al definir requisitos para la cosmética natural y orgánica y al facilitar que los consumidores puedan tomar decisiones de compra más informadas.',
    natrue_p12: 'Esta confianza también beneficia a las marcas que apuestan por formulaciones de calidad y desean comunicar de manera clara y responsable las características de sus productos.',
    natrue_h2_4: 'Innovación y nuevos modelos de comercio',
    natrue_p13: 'La evolución de la cosmética natural y orgánica no depende únicamente de la innovación en ingredientes y formulaciones. También están surgiendo nuevas maneras de descubrir, recomendar y comprar productos.',
    natrue_p14: 'Las comunidades digitales, las recomendaciones entre consumidores y los modelos de compra colaborativa están transformando progresivamente la relación entre las marcas y sus clientes.',
    natrue_p15: 'En lugar de depender exclusivamente de la publicidad tradicional, las marcas pueden crear experiencias en las que los propios consumidores participan en la difusión y el descubrimiento de sus productos.',
    natrue_p16: 'Este tipo de dinámicas puede resultar especialmente interesante para productos cuya propuesta de valor se basa en la calidad de sus ingredientes, la transparencia y la confianza.',
    natrue_h2_5: '¿Dónde entra Tuko?',
    natrue_p17: 'Tuko es una aplicación para Shopify que permite a las marcas crear campañas de compra colectiva.',
    natrue_p18: 'Su funcionamiento se basa en una idea sencilla: los consumidores se unen a un grupo para comprar un producto y, a medida que aumenta el número de participantes, se pueden desbloquear mejores descuentos para todos.',
    natrue_p19: 'De esta forma, la compra deja de ser una experiencia exclusivamente individual y se convierte en una experiencia compartida. Los participantes pueden recomendar el grupo a otras personas, ayudar a alcanzar nuevos objetivos y acceder colectivamente a un mejor precio.',
    natrue_p20: 'Para las marcas de cosmética natural y orgánica, este modelo puede abrir una nueva vía para presentar sus productos a comunidades de consumidores interesadas en la calidad, los ingredientes y el consumo responsable.',
    natrue_p21: 'Además, la compra colectiva permite que la recomendación entre personas forme parte de la propia experiencia de compra, favoreciendo un crecimiento más comunitario y colaborativo.',
    natrue_h2_6: 'Construyendo el comercio de próxima generación',
    natrue_p22: 'El futuro de la cosmética natural y orgánica estará marcado por la transparencia, la confianza, la innovación y la colaboración entre los distintos actores del mercado.',
    natrue_p23: 'Organizaciones como NATRUE desempeñan un papel esencial mediante la creación de estándares que ayudan a identificar productos cosméticos naturales y orgánicos certificados.',
    natrue_p24: 'Al mismo tiempo, soluciones tecnológicas como Tuko exploran nuevas formas de conectar a las marcas con sus comunidades y de hacer que el descubrimiento y la compra de productos sean experiencias más participativas.',
    natrue_p25: 'La combinación de estándares rigurosos, marcas comprometidas, consumidores informados y nuevos modelos de comercio puede generar oportunidades para construir un mercado más transparente, accesible y conectado.',
    natrue_p26: 'Sigamos construyendo.',

    /* ARTICLE: gran-paso-tuko (Spanish) */
    granpaso_title: 'Un gran paso para Tuko 🇪🇸🇨🇭',
    granpaso_p1: 'Durante las últimas semanas Tuko ha seguido avanzando y ya tenemos el prototipo funcionando dentro de Shopify, lo que nos permite empezar a ver cómo se integra el sistema de compras colectivas dentro de tiendas online y seguir ajustando el producto a partir de su funcionamiento real.',
    granpaso_h2_1: 'Del desarrollo en China a nuevas etapas',
    granpaso_p2: 'Gran parte del desarrollo inicial del proyecto se empezó durante nuestra etapa en China, donde comenzamos a trabajar el concepto del producto y a entender mejor cómo funcionan los modelos de compra colectiva dentro del comercio digital.',
    granpaso_p3: 'Actualmente el proyecto sigue creciendo y también estamos presentes en Suiza, ampliando nuestra red y conectando con nuevos entornos dentro del ecosistema de startups y tecnología.',
    granpaso_h2_2: 'Nuevas conexiones y colaboraciones',
    granpaso_p4: 'En paralelo, seguimos generando conexiones con distintos actores del sector. Entre ellos Biovida Sana, una certificadora del ámbito ecológico, con la que estamos en contacto dentro del ecosistema de marcas naturales y sostenibles.',
    granpaso_p5: 'Estas conexiones nos están ayudando a entender mejor las necesidades de las marcas y cómo encaja el modelo de Tuko dentro de su forma de vender online.',
    granpaso_h2_3: 'El equipo detrás del proyecto',
    granpaso_p6: 'El proyecto también se está construyendo desde distintos lugares y con roles complementarios.',
    granpaso_p7: 'Joan está centrado principalmente en España, trabajando en la parte de contactos con marcas, relaciones y expansión dentro del mercado español.',
    granpaso_p8: 'Por otro lado, Rafa está actualmente en Suiza, desde donde sigue impulsando el proyecto, desarrollando el producto y conectando con nuevos entornos internacionales.',
    granpaso_p9: 'Además, en las últimas semanas se ha incorporado nueva gente al equipo, que está ayudando a reforzar el desarrollo y seguir avanzando con el proyecto.',
    granpaso_h2_4: 'Próximos pasos',
    granpaso_p10: 'El objetivo ahora es seguir mejorando el producto, ampliar las conexiones con marcas y continuar desarrollando el proyecto paso a paso.',
    granpaso_p11: "Let's keep building.",

    /* ARTICLE: new-formulas-shanghai */
    newformulas_title: 'New Formulas. Presentando Tuko en Shanghái 🇨🇳',
    newformulas_p1: 'Una tarde en Shanghái resultó ser uno de los momentos más emocionantes del camino hasta ahora.',
    newformulas_p2: 'Fuimos invitados a hablar en "New Formulas – E-Commerce, FMCG and the Future of Retail", un evento que reunió a fundadores, inversores y profesionales del sector para debatir cómo se está construyendo la próxima generación del comercio.',
    newformulas_h2_1: 'La sala estaba llena de constructores',
    newformulas_p3: "Antes de que comenzaran los pitches de startups, la velada arrancó con un panel de profesionales de grandes empresas globales como L'Oréal y Adidas, junto a fundadores y líderes del ecosistema.",
    newformulas_p4: 'La conversación giró en torno a cómo el comportamiento del consumidor, la tecnología y la IA están transformando el retail, especialmente en mercados en rápida evolución como China.',
    newformulas_p5: 'Escuchar a personas que trabajan en la frontera de estas industrias marcó el tono de la noche.',
    newformulas_p6: 'No era un evento cualquiera. Era una sala llena de personas pensando en cómo será el retail en la próxima década.',
    newformulas_h2_2: 'Cinco startups, un escenario',
    newformulas_p7: 'Más tarde esa noche, cinco startups seleccionadas fueron invitadas a presentar sus ideas.',
    newformulas_p8: 'Cada proyecto venía desde un ángulo diferente de la innovación: herramientas de IA para marcas de ecommerce, plataformas que conectan compradores y vendedores globales, nuevas experiencias de consumo y tecnologías de retail.',
    newformulas_p9: 'Entre esas startups estaba Tuko.',
    newformulas_p10: 'Estar ahí, presentando la idea de que las compras deben ser colectivas, en una sala llena de fundadores, inversores y personas muy involucradas en el ecosistema tecnológico chino, fue un momento inolvidable.',
    newformulas_h2_3: 'Un recordatorio de por qué construimos',
    newformulas_p11: 'Momentos como este son poderosos porque muestran lo global que es realmente el mundo de las startups.',
    newformulas_p12: 'Diferentes culturas, diferentes mercados, diferentes ideas, todas convergiendo en torno a la misma pregunta: ¿cuál es el futuro del comercio?',
    newformulas_p13: 'Para nosotros, poder compartir la visión de Tuko en ese entorno no solo fue emocionante, sino también un recordatorio de que el camino en el que estamos acaba de empezar.',
    newformulas_p14: 'Sigamos construyendo.',

    /* ARTICLE: ocea-hub-shanghai */
    ocea_meta: '20 oct 2025 · Equipo Tuko',
    ocea_title: 'OCEA HUB Presentando Tuko en Shanghái 🇨🇳',
    ocea_p1: 'Durante nuestra estancia en Shanghái fuimos invitados a presentar Tuko en OCEA Hub, un espacio de startups e innovación que organiza eventos para fundadores y la comunidad tecnológica local.',
    ocea_h2_1: 'Presentar en un ecosistema diferente',
    ocea_p2: 'Lo que hizo la experiencia especialmente interesante fue el público. La sala estaba casi completamente llena de fundadores, emprendedores y profesionales chinos, y éramos de los muy pocos participantes internacionales invitados a presentar.',
    ocea_p3: 'Junto a Walled, un amigo que también presentaba su proyecto, representamos el lado internacional del evento mientras la mayoría de startups y asistentes formaban parte del ecosistema chino local.',
    ocea_p4: 'Subir al escenario y explicar nuestro proyecto en ese contexto fue un momento único. Nos obligó a comunicar la idea de forma clara y sencilla a personas de un mercado y una cultura completamente diferentes.',
    ocea_h2_2: 'Compartiendo la visión de Tuko',
    ocea_p5: 'Durante la presentación explicamos la idea central de Tuko: el futuro de las compras es colectivo.',
    ocea_p6: 'En lugar de comprar solos, Tuko permite a los consumidores coordinar compras y desbloquear mejores precios juntos, mientras las marcas pueden aumentar sus ventas sin depender tanto de la publicidad.',
    ocea_h2_3: 'Una experiencia memorable',
    ocea_p7: 'Presentar ante un público casi completamente chino fue una gran experiencia y un recordatorio de lo global que es realmente el mundo de las startups. Momentos como este hacen el camino aún más emocionante mientras seguimos construyendo Tuko.',

    /* ARTICLE: spain-innovation-day */
    spain_meta: '30 sept 2025 · Equipo Tuko',
    spain_title: 'Spain Innovation Day Shanghái 🇪🇸🇨🇳',
    spain_p1: 'La semana pasada tuvimos la oportunidad de asistir al Spain Innovation Day en Shanghái, un evento organizado por la Cámara de Comercio española y el ICEX que reunió a startups y empresas españolas que operan en China.',
    spain_h2_1: 'Startups españolas en China',
    spain_p2: 'El evento mostró varias startups innovadoras trabajando en distintos sectores, incluyendo IA, travel tech, tecnología agrícola y servicios digitales. Los fundadores presentaron sus proyectos y compartieron perspectivas sobre cómo construir empresas entre Europa y China.',
    spain_p3: 'Fue una gran oportunidad para ver cómo los emprendedores españoles se están expandiendo internacionalmente y desarrollando soluciones tecnológicas en mercados globales.',
    spain_h2_2: 'Construyendo conexiones',
    spain_p4: 'Más allá de las presentaciones, el evento creó un espacio para conocer a emprendedores, inversores y miembros del ecosistema de innovación español en Shanghái. Las conversaciones con fundadores y líderes del ecosistema ofrecieron perspectivas valiosas sobre cómo escalar startups y construir puentes entre España y China.',
    spain_h2_3: 'Un ecosistema sólido en el exterior',
    spain_p5: 'Spain Innovation Day destacó la creciente presencia de la innovación española en Asia. Formar parte de esta comunidad en Shanghái es inspirador y motivador mientras seguimos construyendo Tuko y explorando oportunidades globales.',
    spain_p6: 'Sigamos construyendo.',

    /* LEGAL: privacidad */
    priv_title: 'Privacidad',
    priv_intro: 'La presente Política de Privacidad describe cómo se recopilan y tratan los datos personales a través de la web de Tuko.',
    priv_h2_1: '<span class="legal-num">1.</span> Responsable del tratamiento',
    priv_p1: 'Hasta la constitución de la sociedad, el responsable del tratamiento es:',
    priv_p2: '<strong>Joan de Zavala Prats y Rafael Alonso Barreto de Vicente</strong><br>Email de contacto: <a href="mailto:team.tukoo@gmail.com" data-i18n="footer_email">team.tukoo@gmail.com</a>',
    priv_p3: 'Este responsable actúa únicamente para gestionar las solicitudes enviadas a través del formulario de contacto.',
    priv_h2_2: '<span class="legal-num">2.</span> Datos que recopilamos',
    priv_p4: 'El único formulario de la web puede recopilar los siguientes datos personales, de forma voluntaria por parte del usuario:',
    priv_li1: 'Nombre',
    priv_li2: 'Email',
    priv_li3: 'Nombre de la tienda / empresa',
    priv_p5: 'No se recopilan más datos ni se utilizan cookies de terceros.',
    priv_h2_3: '<span class="legal-num">3.</span> Finalidad del tratamiento',
    priv_p6: 'Los datos se utilizarán exclusivamente para:',
    priv_li4: 'Responder a solicitudes de contacto',
    priv_li5: 'Coordinar reuniones o demostraciones',
    priv_li6: 'Enviar información relacionada con la instalación o uso de Tuko',
    priv_p7: 'No se elaboran perfiles automatizados.',
    priv_h2_4: '<span class="legal-num">4.</span> Legitimación',
    priv_p8: 'La base legal para el tratamiento es el consentimiento del usuario al enviar el formulario.',
    priv_h2_5: '<span class="legal-num">5.</span> Cesiones de datos',
    priv_p9: 'No compartimos datos personales con ningún tercero. No se realizan transferencias internacionales.',
    priv_h2_6: '<span class="legal-num">6.</span> Conservación',
    priv_p10: 'Los datos se conservarán el tiempo necesario para responder a la solicitud, o hasta que el usuario solicite su eliminación.',
    priv_h2_7: '<span class="legal-num">7.</span> Derechos del usuario',
    priv_p11: 'Puedes ejercer tus derechos de acceso, rectificación, supresión, oposición, limitación del tratamiento o portabilidad enviando un correo a: <a href="mailto:team.tukoo@gmail.com" data-i18n="footer_email">team.tukoo@gmail.com</a>',
    priv_h2_8: '<span class="legal-num">8.</span> Seguridad',
    priv_p12: 'Se aplican medidas de seguridad razonables para proteger los datos personales frente al acceso no autorizado.',
    priv_update: 'Última actualización: 09/12/2025',

    /* LEGAL: terminos */
    terms_title: 'Términos de uso',
    terms_intro: 'El acceso y uso de la web de Tuko están sujetos a los siguientes términos:',
    terms_h2_1: '<span class="legal-num">1.</span> Objeto',
    terms_p1: 'La web de Tuko proporciona información sobre nuestro sistema de compras colectivas y permite a las tiendas contactar con nosotros mediante un formulario.',
    terms_h2_2: '<span class="legal-num">2.</span> Uso permitido',
    terms_p2: 'El usuario se compromete a:',
    terms_li1: 'No utilizar la web para fines ilícitos',
    terms_li2: 'No intentar dañar, sobrecargar o deshabilitar la plataforma',
    terms_li3: 'Proporcionar información veraz en los formularios',
    terms_h2_3: '<span class="legal-num">3.</span> Servicios ofrecidos',
    terms_p3: 'Actualmente, Tuko se encuentra en fase inicial. No se formaliza todavía ningún contrato de prestación de servicios a través de esta web. El formulario sirve únicamente como punto de contacto.',
    terms_h2_4: '<span class="legal-num">4.</span> Propiedad intelectual',
    terms_p4: 'Todo el contenido de la web (textos, diseño, imágenes, marcas) pertenecen a Tuko o se utiliza con autorización. No se permite su reproducción sin consentimiento.',
    terms_h2_5: '<span class="legal-num">5.</span> Exclusión de responsabilidad',
    terms_p5: 'La web se ofrece \u201ctal cual\u201d. No garantizamos disponibilidad continua, ausencia de errores o compatibilidad con todos los dispositivos. No nos hacemos responsables de daños derivados del uso o imposibilidad de uso de la web.',
    terms_h2_6: '<span class="legal-num">6.</span> Datos personales',
    terms_p6: 'El tratamiento de los datos personales se rige por nuestra <a href="privacidad.html" target="_blank">Política de Privacidad</a>.',
    terms_h2_7: '<span class="legal-num">7.</span> Modificaciones',
    terms_p7: 'Tuko podrá modificar estos términos en cualquier momento. El uso continuado tras los cambios implica aceptación.',
    terms_h2_8: '<span class="legal-num">8.</span> Contacto',
    terms_p8: 'Para cualquier duda, escribe a: <a href="mailto:team.tukoo@gmail.com" data-i18n="footer_email">team.tukoo@gmail.com</a>',
  },

  en: {
    /* NAV */
    nav_link_problema: 'The problem',
    nav_link_como_funciona: 'How it works',
    nav_link_precios: 'Pricing',
    nav_link_faq: 'FAQ',
    nav_link_beneficios: 'What you get',
    nav_link_blog: 'Blog',
    nav_cta: 'Install free',
    nav_lang_label: 'Language',
    /* TUKO AI */
    nav_link_ia: 'tuko AI',
    ia_status: 'In development',
    ia_lead: '<span class="ia-lead-brand">tuko AI</span> builds your <span class="ia-lead-key">campaigns</span> <em>for you</em>: it reads your store and your market, and decides what to sell, at <span class="ia-lead-key">what price</span> and <span class="ia-lead-key">when</span>.',
    ia_note: 'In development. Coming inside Tuko.',
    ia_cta_primary: 'Join the waitlist',
    ia_cta_secondary: 'See how Tuko works',
    ia_signals_eyebrow: 'What it reads',
    ia_signals_title: 'Six signals. One campaign, ready',
    ia_signals_sub: 'tuko AI combines your store data with your market data to decide which product to put in a campaign, at what price and when.',
    ia_sig1_title: 'Your market',
    ia_sig1_text: 'Real demand in your category, seasonality and where prices are heading.',
    ia_sig2_title: 'Your competitors',
    ia_sig2_text: 'What they are launching, at what discounts, and where there is a gap you can take.',
    ia_sig3_title: 'Your calendar',
    ia_sig3_text: 'Campaigns, key dates and the traffic peaks where a campaign fills itself.',
    ia_sig4_title: 'Your location',
    ia_sig4_text: 'Where your buyers are, so orders group by area and share shipping.',
    ia_sig5_title: 'Your products',
    ia_sig5_text: 'Margins, idle stock and which items can absorb a volume discount.',
    ia_sig6_title: 'Your sales',
    ia_sig6_text: 'Your history and your data: what sells together, how often, and at what price it converts.',
    ia_flow_eyebrow: 'How it will work',
    ia_flow_title: 'From zero to campaign, with no research',
    ia_flow_sub: 'Setting up a campaign today means choosing product, discounts and minimums by hand. tuko AI handles all of it.',
    ia_step1_title: 'Connect',
    ia_step1_text: 'You install Tuko on your Shopify. tuko AI reads your catalogue and sales history. Nothing to fill in.',
    ia_step2_title: 'Propose',
    ia_step2_text: 'You get the campaign ready-made: which product, which discounts, how many units are needed and how long it runs.',
    ia_step3_title: 'Learns',
    ia_step3_text: 'Every completed campaign makes it sharper: it learns from how your buyers behave and tunes the next campaign on its own.',
    ia_final_title: 'Be among the first to try it',
    ia_final_sub: 'tuko AI is in development. Leave your email and we will tell you as soon as early access opens.',
    ia_final_btn: 'I want early access',
    ia_form_title: 'Join the tuko <span>AI</span> waitlist',
    ia_form_intro: 'We will let you know as soon as early access opens. No spam.',
    ia_form_submit: 'Join the waitlist',
    ia_soon_tag: 'Soon',
    ia_soon_text: 'It will also tell you which creators to work with and where to grow next.',
    ia_wl_eyebrow: 'Waitlist',
    ia_wl_count: '<b>39 brands</b> are already waiting for access',
    ia_wl_foot: 'Only 50 stores get into the private beta.',
    fcta_eyebrow: 'Start today',
    fcta_title: 'Try a campaign<br><em>If you don\'t sell, you don\'t pay</em>',
    fcta_sub: 'Install is free and the entry plan has no monthly fee: we only take a percentage of what you sell with Tuko, with a monthly cap.<br><br>If you don\'t run a campaign that month, you pay zero.',
    fcta_btn: 'Install free on Shopify',
    fcta_trust2: 'No monthly fee',
    fcta_trust3: '+50 stores already using it',
    fcta_shopify: 'Available on Shopify',

    /* HERO */
    hero_badge: 'Backed by Xiji Incubator',
    hero_title: 'The discount that<br>brings you <em>customers</em>, instead of taking them away',
    hero_subtitle: 'You set a unit goal on a product and a deadline. Your customers reserve with nothing charged yet.<span class="s-para-gap" aria-hidden="true"></span>If the goal is hit, everyone pays the lower price; if not, they pay the regular price and you haven\'t given away a euro of margin.',
    hero_cta: 'Install free on Shopify',
    hero_official: 'No fee · We only charge if you sell',
    hero_stat1_num: '+50',
    hero_stat1_lab: 'Stores using Tuko',
    hero_stat2_num: '+€30,000',
    hero_stat2_lab: 'Billed through Tuko campaigns',

    /* POPUP DEL PLUGIN */
    pop_chip: 'CAMPAIGN LIVE',
    pop_title: 'Need <b>10</b> more units to unlock <em>€25.20</em>',
    pop_title_before: 'Need ',
    pop_title_people: 'more units',
    pop_title_mid: ' to unlock ',
    pop_title_deal: '€25.20',
    pop_timer: 'Ends in',
    pop_days: 'Days',
    pop_hours: 'Hours',
    pop_minutes: 'Minutes',
    pop_seconds: 'Seconds',
    pop_product: 'Natural Shampoo',
    pop_joined: ' of 20 units reserved',
    pop_cta: 'Drop it to €25.20',
    pop_no_charge: 'Nothing is charged until the campaign ends.',
    pop_back_title: 'How a <em>Tuko campaign</em> works',
    pop_back_sub: 'The more units reserved, the bigger the discount for everyone.',
    pop_tier1: '10 units',
    pop_tier2: '20 units',
    pop_tier3: '35 units',
    pop_step1: 'You pick a product, a unit goal and a deadline.',
    pop_step2: 'Your customers reserve at your checkout; the amount is held, with nothing charged yet.',
    pop_step3: 'Anyone who already reserved shares to help hit the goal.',
    pop_step4: 'When it closes, everyone is charged the price of the tier reached.',
    pop_step5: 'If no tier is reached, they pay the regular price.',
    pop_front_hint: 'Click to flip',
    pop_front_hint_tap: 'Tap to flip',
    pop_back_foot: 'Click to go back',
    pop_back_foot_tap: 'Tap to go back',

    /* VIDEO */
    video_title: 'A <span class="video-brand">Tuko</span> campaign, <em class="video-title-em">start to finish</em>',
    video_subtitle: 'Two minutes: how you set up the campaign, what your customer sees on the product page, and what happens when the goal is hit.',

    /* LOGOS */
    logos_label: 'Trusted by',
    logo_upm: 'Universidad Politécnica de Madrid',
    logo_xiji: 'Xiji Incubator',
    logo_ocea: 'OCEA HUB',
    logo_bio: 'Bio Vida Sana',
    logo_saper: 'Sáper Organic',

    /* PROBLEM */
    problem_badge: 'The problem',
    problem_title: 'Cutting the price isn\'t the problem.<br><span class="title-accent">Giving it away</span> to people who were<br>going to buy anyway <em class="title-accent-em">is</em>',
    problem_sub: 'Every flat discount also goes to customers who would have bought at full price.<span class="s-para-gap" aria-hidden="true"></span>You\'re paying margin on sales you already had.',
    card1_title: 'Every new customer costs you more',
    card1_text: 'The cost of acquiring a customer in ecommerce has risen more than 200% in a decade.<span class="s-para-gap" aria-hidden="true"></span>Every sale you bring in with ads is more expensive than the last.',
    card2_title: 'Idle stock eats your margin',
    card2_text: 'Cutting 30% moves it, sure. But it wipes the profit on the whole batch.<span class="s-para-gap" aria-hidden="true"></span>And customers who were already going to buy take the discount too.',
    card3_title: 'A flat discount doesn\'t pay for itself',
    card3_text: 'A −20% on a product with 60% margin forces you to sell 67% more units just to stay even.<span class="s-para-gap" aria-hidden="true"></span>That almost never happens.',
    card1_source: 'Source: SimplicityDX, “The Customer Acquisition Crisis”',
    card2_source: 'Illustrative margin example on a 30% markdown',
    card3_source: 'Break-even threshold calculation (60% margin, −20% discount)',

    /* HOW IT WORKS */
    how_badge: 'How it works',
    how_title: 'A discount with conditions.<br><span class="how-title-underline">Yours</span>',
    how_sub: 'You pick a product, a unit goal and a deadline.<span class="s-para-gap" aria-hidden="true"></span>The discount doesn\'t exist until the goal is met.<span class="s-para-gap" aria-hidden="true"></span>Everything happens inside your store: the customer never leaves your site.',
    how_step1: 'You pick a product and a goal.',
    how_step2: 'Your customers reserve, as usual.',
    how_step3: 'They bring the ones still missing.',
    how_step4: 'The campaign closes and everyone is charged.',

    /* HOW IT WORKS — STEPS */
    step1_title: 'You pick a product and a goal',
    step1_desc: 'One product, a unit goal and a deadline (72 hours works well).<span class="s-para-gap" aria-hidden="true"></span>You set the discount ladder: you never give away a point of margin beyond what you decide.',
    step2_title: 'Your customers reserve, as usual',
    step2_desc: 'They see on the product page how many units are left for the next price and go through your usual checkout—no signing up elsewhere, no meeting anyone.<span class="s-para-gap" aria-hidden="true"></span>The amount is held on their card, but nothing is charged yet.',
    step3_title: 'They bring the ones still missing',
    step3_desc: 'Anyone who already reserved wants the goal to be hit, so they share it.<span class="s-para-gap" aria-hidden="true"></span>That traffic didn\'t cost you a thing.',
    step4_title: 'The campaign closes and everyone is charged',
    step4_desc: 'When the deadline ends, everyone is charged the price of the tier reached.<span class="s-para-gap" aria-hidden="true"></span>If none is reached, each customer pays the regular price and the sale is still yours.<span class="s-para-gap" aria-hidden="true"></span>You never lose a sale for trying.',

    /* PRICING */
    pricing_badge: 'Pricing',
    pricing_title: 'We only win if you <em class="title-accent-em">sell</em>',
    pricing_sub: 'No entry fee and no lock-in.<span class="s-para-gap" aria-hidden="true"></span>We take a percentage of what you sell in Tuko campaigns, with a monthly cap you approve before anything is charged.<span class="s-para-gap" aria-hidden="true"></span>If you don\'t run a campaign that month, your bill is zero.',
    pricing_per_month: '/mo',
    pricing_recommended: 'Recommended',
    pricing_p1_name: 'Start',
    pricing_p1_price: '€0',
    pricing_p1_comm: '+ 5% of what you sell with Tuko',
    pricing_p1_f1: '1 active campaign at a time',
    pricing_p1_f2: 'Ladder of up to 3 tiers',
    pricing_p1_f3: 'Widget on the product page',
    pricing_p1_f4: 'Campaign analytics',
    pricing_p1_cap: 'Cap: €300/mo',
    pricing_p1_foot: 'If you don\'t sell, you pay €0.',
    pricing_p1_cta: 'Start free',
    pricing_p2_name: 'Growth',
    pricing_p2_price: '€49',
    pricing_p2_comm: '+ 2.5% of what you sell with Tuko',
    pricing_p2_f1: 'Unlimited simultaneous campaigns',
    pricing_p2_f2: 'Smart pop-up',
    pricing_p2_f3: 'A/B tests for ladders and copy',
    pricing_p2_f4: 'Goals in units or people',
    pricing_p2_f5: 'Support within 24h',
    pricing_p2_cap: 'Cap: €700/mo',
    pricing_p2_foot: 'Worth it from €1,960/mo sold with Tuko.',
    pricing_p2_cta: 'Choose plan',
    pricing_p3_name: 'Scale',
    pricing_p3_price: '€149',
    pricing_p3_comm: '+ 1.2% of what you sell with Tuko',
    pricing_p3_f1: 'Everything in Growth',
    pricing_p3_f2: 'Tuko AI: suggested goals and ladders',
    pricing_p3_f3: 'Multi-store and multi-language',
    pricing_p3_f4: 'Monthly margin report',
    pricing_p3_f5: 'Account manager',
    pricing_p3_cap: 'Cap: €1,800/mo',
    pricing_p3_foot: 'Worth it from €7,700/mo sold with Tuko.',
    pricing_p3_cta: 'Choose plan',
    pricing_p4_name: 'Enterprise',
    pricing_p4_price: 'Custom',
    pricing_p4_comm: 'Negotiated commission and cap',
    pricing_p4_f1: 'Multiple stores or markets',
    pricing_p4_f2: 'Custom integrations',
    pricing_p4_f3: 'Service-level agreement',
    pricing_p4_f4: 'Support on every campaign',
    pricing_p4_foot: 'We’ll talk and fit it to your volume.',
    pricing_p4_cta: 'Let’s talk',
    pricing_legal: 'The percentage is calculated only on what you sell in Tuko campaigns—never on the rest of your revenue. The cap is the most you can pay in a month, and you approve it in Shopify before any charge applies.',
    pricing_link_calc: 'How much would you need to sell for it to pay off? Run the numbers →',
    pricing_link_faq: 'Still have questions? See the FAQ →',

    /* FAQ */
    faq_badge: 'FAQ',
    faq_title: 'What we get asked <em class="title-accent-em">every time</em>',
    faq_sub: 'Real objections from sales calls, answered in writing for the people who will never pick up the phone.',
    faq_q1: 'When does my customer get charged?',
    faq_a1: 'Only when the campaign closes. At checkout the regular price is held on their card, but nothing is charged yet—the money stays in their account. When the deadline ends or the goal is hit, they are charged once, with the discount of the tier reached already applied.',
    faq_q2: 'Do my customers have to buy with strangers?',
    faq_a2: 'No. Nobody joins a group or meets anyone. Each customer reserves on their own, through your usual checkout. The only change is that they see how many units are left for the price to drop.',
    faq_q3: 'What if the goal isn\'t reached?',
    faq_a3: 'They are charged the regular price—the same one they already accepted when they reserved. The sale is still yours and you haven\'t given away margin. You never lose a sale for trying.',
    faq_q4: 'Won\'t this wreck my margin?',
    faq_a4: 'The opposite of a flat markdown: the discount doesn\'t exist until the volume that pays for it arrives. You set the maximum discount and Tuko warns you before you publish if a tier eats your margin.',
    faq_q5: 'Is this like Groupon?',
    faq_a5: 'No. Groupon brought deal hunters from its own list, took a large cut of every sale, and those customers rarely came back. With Tuko everything stays inside your store, with your customers and in your database—and the discount only appears if it has brought you new sales.',
    faq_q6: 'I already use a volume-discount app. Why do I need this?',
    faq_a6: 'That one makes a customer buy three units. Tuko makes three customers buy one. They complement each other: one raises ticket size, the other brings buyers.',
    faq_q7: 'What if my customers never share anything?',
    faq_a7: 'The first wave of a campaign doesn\'t come from cold traffic: it comes from your email list and your social channels—people who already follow you. Sharing speeds things up; it isn\'t what starts them. And the first tier is designed so sharing is genuinely worth it.',
    faq_q8: 'How much does it cost?',
    faq_a8: 'Install is free and there is no monthly fee on the entry plan. We only take a percentage of what you sell through Tuko campaigns, with a monthly cap you see and approve before anything is applied. If you run no campaigns in a month, you pay zero.',

    /* MOCKUP */
    mockup_product_name: 'Cream set',
    mockup_reviews: '4.7 (179 reviews)',
    mockup_price_old: '\u20ac61.99',
    mockup_price_new: '\u20ac54.99',
    mockup_btn_cart: 'Add to cart',
    mockup_btn_join: 'Join the group',
    mockup_tip_label: 'New option',
    mockup_tip_text: 'Lets customers reserve in a campaign',

    /* BENEFITS */
    benefits_badge: 'What you get',
    benefits_title: 'A volume discount makes one customer buy three units. <span class="title-accent">Tuko</span> makes <em class="title-accent-em">three customers</em> buy one',
    benefits_sub: 'It isn\'t another discount app.<span class="s-para-gap" aria-hidden="true"></span>It\'s the only one that uses the discount to bring you buyers you didn\'t have.',
    ben1_title: 'More units per campaign',
    ben1_text: 'Same product, same week—selling double or triple the units.<span class="s-para-gap" aria-hidden="true"></span>Without raising your ad budget by a euro.',
    ben2_title: 'Idle stock, cleared',
    ben2_text: 'Turn the markdown you were going to make anyway into a sale conditioned on volume.<span class="s-para-gap" aria-hidden="true"></span>Free up capital without giving away margin.',
    ben3_title: 'You set the floor',
    ben3_text: 'You define the ladder and the maximum discount.<span class="s-para-gap" aria-hidden="true"></span>Tuko warns you if a tier eats your margin before you publish the campaign.',
    ben4_title: 'Buyers you didn\'t pay for',
    ben4_text: 'Every customer who already reserved has a financial reason to share it.<span class="s-para-gap" aria-hidden="true"></span>That traffic costs you zero.',
    ben5_title: 'Live in two minutes',
    ben5_text: 'Native Shopify app. It adds to the product page without touching your theme or checkout.',
    ben6_title: 'No refunds or manual adjustments',
    ben6_text: 'Customers get an authorization hold when they reserve and are charged once when the campaign closes, with the discount already applied.<span class="s-para-gap" aria-hidden="true"></span>No partial charges or refunds to manage.',

    /* CTA */
    cta_title: 'Install Tuko and turn traffic into real sales.',
    cta_label_email: 'Email',
    cta_placeholder_email: 'Your email',
    cta_label_name: 'Name',
    cta_placeholder_name: 'Your name',
    cta_label_business: 'Business name',
    cta_placeholder_business: 'Your business name',
    cta_label_phone: 'Mobile phone (optional)',
    cta_placeholder_phone: 'Your mobile (max 20 characters)',
    cta_label_details: 'Description or details (optional)',
    cta_placeholder_details: 'Short message (max 100 characters)',
    cta_submit: 'Contact us',
    cta_success: 'Message sent! We\'ll be in touch soon.',
    cta_error: 'Something went wrong. Please write to us at team.tukoo@gmail.com',

    /* FOOTER */
    footer_col1_title: 'Contact',
    footer_email: 'team.tukoo@gmail.com',
    footer_col_product: 'Product',
    footer_pricing: 'Pricing',
    footer_col2_title: 'Legal',
    footer_privacy: 'Privacy policy',
    footer_terms: 'Terms and conditions',
    footer_tagline: 'Goal-based discounts for Shopify stores. Sell more units without giving away margin.',
    footer_copy: '© 2026 Tuko. All rights reserved.',

    /* BLOG INDEX */
    blog_badge: 'Resources',
    blog_title: 'Blog',
    blog_subtitle: 'Use cases, news and group buying strategies.',
    blog_categories: 'Categories',
    blog_cat_all: 'All articles',
    blog_sort: 'Sort by',
    blog_sort_new: 'Newest first',
    blog_sort_old: 'Oldest first',
    blog_sort_short: 'Shortest read',
    blog_sort_az: 'Title A–Z',
    blog_count: 'articles',
    blog_read: 'Read article',
    blog_empty: 'No articles in this category yet.',
    blog_post1_title: 'NATRUE and the future of collaborative commerce',
    blog_post1_meta: '17 Mar 2026 · Tuko Team',
    blog_post2_title: 'A big step for Tuko 🇪🇸🇨🇭',
    blog_post2_meta: '19 Feb 2026 · Tuko Team',
    blog_post3_title: 'New Formulas. Pitching Tuko in Shanghai 🇨🇳',
    blog_post3_meta: '14 Nov 2025 · Tuko Team',
    blog_post4_title: 'OCEA HUB Presenting Tuko in Shanghai 🇨🇳',
    blog_post4_meta: '20 Oct 2025 · Tuko Team',
    blog_post5_title: 'Spain Innovation Day Shanghai 🇪🇸🇨🇭',
    blog_post5_meta: '30 Sep 2025 · Tuko Team',
    blog_post6_title: 'S-Tron Tech Trek Experience Shanghai 🇨🇳',
    blog_post6_meta: '23 Sep 2025 · Tuko Team',
    blog_post7_title: 'Starting Our Journey at Xiji Incubator Shanghai 🇨🇳',
    blog_post7_meta: '10 Sep 2025 · Tuko Team',
    blog_ver_mas: 'Load more',

    /* ARTICLE COMMON */
    article_back: '\u2190 Back to blog',

    /* ARTICLE: shiji-incubator (English — same) */
    shiji_meta: '10 Sep 2025 · Tuko Team',
    shiji_title: 'Starting Our Journey at Xiji Incubator Shanghai 🇨🇳',
    shiji_p1: 'A few weeks ago we arrived in Shanghai to start a new chapter for Tuko.',
    shiji_p2: 'For the next months we will be part of Xiji Incubator, an international startup program based at Tongji University, designed to help early-stage founders build and scale global startups.',
    shiji_p3: 'This opportunity allows us to work from one of the most dynamic entrepreneurial ecosystems in the world while continuing to develop the vision behind Tuko.',
    shiji_p4: 'And honestly, it feels like the perfect place to do it.',
    shiji_h2_1: 'Why Shanghai?',
    shiji_p5: 'Shanghai is one of the most exciting places on the planet to build technology.',
    shiji_p6: 'Everywhere you look there are startups, investors, new products and ambitious people trying to build something big. The speed at which companies are created here is something you immediately notice.',
    shiji_p7: 'China has already shown the world how powerful group buying models can be. Platforms like Pinduoduo have transformed how millions of people buy products online by turning shopping into a social experience.',
    shiji_p8: 'Being here gives us the opportunity to understand these models much deeper and learn directly from the ecosystem where many of them were born.',
    shiji_h2_2: 'What are we building?',
    shiji_p9: 'Tuko is based on a simple idea: when people buy together, everyone should pay less. Our platform allows users to join group purchases that unlock better discounts as more people participate.',
    shiji_p10: 'At the same time, brands benefit by selling larger volumes while reducing customer acquisition costs.',
    shiji_h2_3: 'What comes next?',
    shiji_p11: 'During the program we will focus on improving our MVP, testing the concept with users and brands, and learning as much as possible from the ecosystem around us.',
    shiji_p12: "LET'S DO IT",

    /* ARTICLE: stron-tech-trek (English — same) */
    stron_meta: '23 Sep 2025 · Tuko Team',
    stron_title: 'S-Tron Tech Trek Experience Shanghai 🇨🇳',
    stron_p1: 'Last week we were invited to attend S-Tron Shanghai Tech Trek at the West Bund Art Center, an innovation event connected to the Xiji Incubator ecosystem that brings together founders, investors and technology companies.',
    stron_h2_1: 'Building Connections',
    stron_p2: 'Beyond the talks and startup demos, the most valuable part was the opportunity to meet venture capital investors, founders and innovation leaders from different industries. Events like this create the perfect environment to exchange ideas, explore collaborations and build relationships within the Shanghai tech ecosystem.',
    stron_h2_2: 'What are we building?',
    stron_p3: 'Tuko is based on a simple idea: when people buy together, everyone should pay less. Our platform allows users to join group purchases that unlock better discounts as more people participate.',
    stron_p4: 'At the same time, brands benefit by selling larger volumes while reducing customer acquisition costs.',
    stron_h2_3: 'What we take away?',
    stron_p5: 'Experiences like S-Tron show how powerful the innovation ecosystem in Shanghai is. Being able to connect with people building and investing in technology is incredibly valuable as we continue developing Tuko.',
    stron_p6: "Let's keep building.",

    /* ARTICLE: natrue-x-tuko (English — same) */
    natrue_title: 'NATRUE and the future of collaborative commerce',
    natrue_h2_1: 'The rise of natural and organic cosmetics',
    natrue_p1: 'The cosmetics market is going through a major transformation. More and more consumers are looking for products made with natural ingredients, responsible processes and greater transparency about their composition and how they are made.',
    natrue_p2: 'This shift in consumer habits has driven the growth of natural and organic cosmetics. At the same time, it has led many brands to pay particular attention to the quality and origin of their ingredients, the sustainability of their processes and the trust they convey to their customers.',
    natrue_p3: 'In this context, independent standards and certifications play a fundamental role, as they help consumers identify products that meet defined and verifiable criteria.',
    natrue_h2_2: 'What is NATRUE?',
    natrue_p4: 'NATRUE is an international non-profit association based in Brussels, founded in 2007 with the aim of promoting and protecting natural and organic cosmetics worldwide.',
    natrue_p5: 'Through its international standard, NATRUE sets strict criteria concerning the ingredients used, the permitted transformation processes and the composition of cosmetic products.',
    natrue_p6: 'The NATRUE label certifies finished cosmetic products at two levels:',
    natrue_li1: 'Natural cosmetics.',
    natrue_li2: 'Organic cosmetics.',
    natrue_p7: 'To obtain certification, products must pass an assessment carried out by independent, approved certification bodies. In this way, the label helps consumers, brands and manufacturers recognise products that meet the requirements set by the NATRUE standard.',
    natrue_p8: 'NATRUE also adapts its criteria to different categories of cosmetic products, taking into account that the formulation and characteristics of a shampoo, a cream, a make-up product or an oil can be very different.',
    natrue_h2_3: 'The importance of transparency and trust',
    natrue_p9: 'In a market with a growing number of products presented as natural or organic, having clear and verifiable criteria is especially important.',
    natrue_p10: 'Independent standards contribute to greater transparency about product composition and help reduce confusion among consumers.',
    natrue_p11: 'Organisations such as NATRUE play a relevant role by defining requirements for natural and organic cosmetics and by making it easier for consumers to make better-informed purchasing decisions.',
    natrue_p12: 'This trust also benefits brands that invest in quality formulations and want to communicate the characteristics of their products clearly and responsibly.',
    natrue_h2_4: 'Innovation and new commerce models',
    natrue_p13: 'The evolution of natural and organic cosmetics does not depend solely on innovation in ingredients and formulations. New ways of discovering, recommending and buying products are also emerging.',
    natrue_p14: 'Digital communities, peer recommendations and collaborative buying models are progressively transforming the relationship between brands and their customers.',
    natrue_p15: 'Instead of relying exclusively on traditional advertising, brands can create experiences in which consumers themselves take part in spreading and discovering their products.',
    natrue_p16: 'This kind of dynamic can be especially interesting for products whose value proposition is based on ingredient quality, transparency and trust.',
    natrue_h2_5: 'Where does Tuko fit in?',
    natrue_p17: 'Tuko is a Shopify app that lets brands create group buying campaigns.',
    natrue_p18: 'It works on a simple idea: consumers join a group to buy a product and, as the number of participants grows, better discounts can be unlocked for everyone.',
    natrue_p19: 'This way, buying stops being a purely individual experience and becomes a shared one. Participants can recommend the group to others, help reach new targets and collectively access a better price.',
    natrue_p20: 'For natural and organic cosmetics brands, this model can open a new path to present their products to consumer communities interested in quality, ingredients and responsible consumption.',
    natrue_p21: 'Group buying also makes peer recommendation part of the shopping experience itself, encouraging more community-driven and collaborative growth.',
    natrue_h2_6: 'Building next-generation commerce',
    natrue_p22: 'The future of natural and organic cosmetics will be shaped by transparency, trust, innovation and collaboration between the different players in the market.',
    natrue_p23: 'Organisations such as NATRUE play an essential role by creating standards that help identify certified natural and organic cosmetic products.',
    natrue_p24: 'At the same time, technology solutions such as Tuko explore new ways to connect brands with their communities and to make discovering and buying products a more participatory experience.',
    natrue_p25: 'The combination of rigorous standards, committed brands, informed consumers and new commerce models can create opportunities to build a more transparent, accessible and connected market.',
    natrue_p26: 'Let us keep building.',

    /* ARTICLE: gran-paso-tuko (EN translation) */
    granpaso_title: 'A big step for Tuko 🇪🇸🇨🇭',
    granpaso_p1: 'Over the past few weeks, Tuko has continued to move forward and we now have the prototype running inside Shopify, which allows us to start seeing how the group buying system integrates into online stores and continue adjusting the product based on real usage.',
    granpaso_h2_1: 'From development in China to new stages',
    granpaso_p2: 'A large part of the initial development of the project started during our time in China, where we began working on the product concept and gaining a better understanding of how group buying models work within digital commerce.',
    granpaso_p3: 'The project continues to grow and we are now also present in Switzerland, expanding our network and connecting with new environments within the startup and technology ecosystem.',
    granpaso_h2_2: 'New connections and collaborations',
    granpaso_p4: 'In parallel, we continue to build connections with different players in the sector. Among them Biovida Sana, an organic certification body, with whom we are in contact within the natural and sustainable brands ecosystem.',
    granpaso_p5: "These connections are helping us better understand the needs of brands and how Tuko's model fits within the way they sell online.",
    granpaso_h2_3: 'The team behind the project',
    granpaso_p6: 'The project is also being built from different locations and with complementary roles.',
    granpaso_p7: 'Joan is mainly focused in Spain, working on brand contacts, relationships and expansion within the Spanish market.',
    granpaso_p8: 'On the other hand, Rafa is currently in Switzerland, where he continues to drive the project, developing the product and connecting with new international environments.',
    granpaso_p9: 'Additionally, over the past few weeks new people have joined the team, helping to strengthen development and continue pushing the project forward.',
    granpaso_h2_4: 'Next steps',
    granpaso_p10: 'The goal now is to continue improving the product, expanding connections with brands and continuing to develop the project step by step.',
    granpaso_p11: "Let's keep building.",

    /* ARTICLE: new-formulas-shanghai (English — same) */
    newformulas_title: 'New Formulas. Pitching Tuko in Shanghai 🇨🇳',
    newformulas_p1: 'One evening in Shanghai turned out to be one of the most exciting moments of the journey so far.',
    newformulas_p2: 'We were invited to speak at \u201cNew Formulas \u2013 E-Commerce, FMCG and the Future of Retail,\u201d an event that brought together founders, investors and industry professionals to discuss how the next generation of commerce is being built.',
    newformulas_h2_1: 'The room was full of builders',
    newformulas_p3: "Before the startup pitches began, the evening opened with a panel featuring professionals from major global companies like L\u2019Or\u00e9al and Adidas, alongside founders and ecosystem leaders.",
    newformulas_p4: 'The conversation revolved around how consumer behavior, technology and AI are reshaping retail, especially in fast-moving markets like China.',
    newformulas_p5: 'Listening to people working at the frontier of these industries set the tone for the night.',
    newformulas_p6: "This wasn\u2019t just another event. It was a room full of people thinking about what retail will look like in the next decade.",
    newformulas_h2_2: 'Five startups, one stage',
    newformulas_p7: 'Later that evening, five selected startups were invited to present their ideas.',
    newformulas_p8: 'Each project came from a different angle of innovation: AI tools for e-commerce brands, platforms connecting global buyers and sellers, new consumer experiences and retail technologies.',
    newformulas_p9: 'Among those startups was Tuko.',
    newformulas_p10: 'Standing there, presenting the idea that shopping should be collective, in a room filled with founders, investors and people deeply involved in the Chinese tech ecosystem, was an unforgettable moment.',
    newformulas_h2_3: 'A reminder of why we build',
    newformulas_p11: 'Moments like this are powerful because they show how global the startup world really is.',
    newformulas_p12: 'Different cultures, different markets, different ideas, all coming together around the same question: what is the future of commerce?',
    newformulas_p13: "For us, being able to share the vision of Tuko in that environment was not only exciting, but also a reminder that the journey we\u2019re on is only just beginning.",
    newformulas_p14: "Let's keep building.",

    /* ARTICLE: ocea-hub-shanghai (English — same) */
    ocea_meta: '20 Oct 2025 · Tuko Team',
    ocea_title: 'OCEA HUB Presenting Tuko in Shanghai 🇨🇳',
    ocea_p1: 'During our time in Shanghai we were invited to present Tuko at OCEA Hub, a startup and innovation space that hosts events for founders and the local tech community.',
    ocea_h2_1: 'Presenting in a different ecosystem',
    ocea_p2: 'What made the experience especially interesting was the audience. The room was almost entirely filled with Chinese founders, entrepreneurs and professionals, and we were among the very few international participants invited to present.',
    ocea_p3: 'Together with Walled, a friend of mine who was also presenting his project, we represented the international side of the event while most of the startups and attendees were part of the local Chinese ecosystem.',
    ocea_p4: 'Standing on stage and explaining our project in that context was a unique moment. It forced us to communicate the idea clearly and simply to people coming from a completely different market and culture.',
    ocea_h2_2: 'Sharing the vision of Tuko',
    ocea_p5: 'During the presentation we explained the core idea behind Tuko: the future of shopping is collective.',
    ocea_p6: 'Instead of people buying alone, Tuko allows consumers to coordinate purchases and unlock better prices together, while brands can increase sales without relying heavily on advertising.',
    ocea_h2_3: 'A memorable experience',
    ocea_p7: 'Presenting in front of an almost entirely Chinese audience was a great experience and a reminder of how global the startup world really is. Moments like this make the journey even more exciting as we continue building Tuko.',

    /* ARTICLE: spain-innovation-day (English — same) */
    spain_meta: '30 Sep 2025 · Tuko Team',
    spain_title: 'Spain Innovation Day Shanghai 🇪🇸🇨🇳',
    spain_p1: 'Last week we had the opportunity to attend Spain Innovation Day in Shanghai, an event organized by the Spanish Chamber of Commerce and ICEX that brought together Spanish startups and companies operating in China.',
    spain_h2_1: 'Spanish Startups in China',
    spain_p2: 'The event showcased several innovative startups working in different sectors, including AI, travel tech, agriculture technology and digital services. Founders presented their projects and shared insights about building companies between Europe and China.',
    spain_p3: 'It was a great opportunity to see how Spanish entrepreneurs are expanding internationally and developing technology-driven solutions in global markets.',
    spain_h2_2: 'Building connections',
    spain_p4: 'Beyond the presentations, the event created a space to meet entrepreneurs, investors and members of the Spanish innovation ecosystem in Shanghai. Conversations with founders and ecosystem leaders offered valuable perspectives on scaling startups and building bridges between Spain and China.',
    spain_h2_3: 'A strong ecosystem abroad',
    spain_p5: 'Spain Innovation Day highlighted the growing presence of Spanish innovation in Asia. Being part of this community in Shanghai is both inspiring and motivating as we continue building Tuko and exploring global opportunities.',
    spain_p6: "Let's keep building.",

    /* LEGAL: privacidad (EN) */
    priv_title: 'Privacy',
    priv_intro: 'This Privacy Policy describes how personal data is collected and processed through the Tuko website.',
    priv_h2_1: '<span class="legal-num">1.</span> Data controller',
    priv_p1: 'Until the company is formally incorporated, the data controller is:',
    priv_p2: '<strong>Joan de Zavala Prats and Rafael Alonso Barreto de Vicente</strong><br>Contact email: <a href="mailto:team.tukoo@gmail.com" data-i18n="footer_email">team.tukoo@gmail.com</a>',
    priv_p3: 'This controller acts solely to manage requests submitted through the contact form.',
    priv_h2_2: '<span class="legal-num">2.</span> Data we collect',
    priv_p4: 'The only form on the website may collect the following personal data, voluntarily provided by the user:',
    priv_li1: 'Name',
    priv_li2: 'Email',
    priv_li3: 'Store / company name',
    priv_p5: 'No additional data is collected and no third-party cookies are used.',
    priv_h2_3: '<span class="legal-num">3.</span> Purpose of processing',
    priv_p6: 'Data will be used exclusively to:',
    priv_li4: 'Respond to contact requests',
    priv_li5: 'Schedule meetings or demonstrations',
    priv_li6: 'Send information related to the installation or use of Tuko',
    priv_p7: 'No automated profiles are created.',
    priv_h2_4: '<span class="legal-num">4.</span> Legal basis',
    priv_p8: "The legal basis for processing is the user's consent when submitting the form.",
    priv_h2_5: '<span class="legal-num">5.</span> Data sharing',
    priv_p9: 'We do not share personal data with any third party. No international transfers are made.',
    priv_h2_6: '<span class="legal-num">6.</span> Retention',
    priv_p10: 'Data will be retained for as long as necessary to respond to the request, or until the user requests its deletion.',
    priv_h2_7: '<span class="legal-num">7.</span> User rights',
    priv_p11: 'You can exercise your rights of access, rectification, erasure, objection, restriction of processing or portability by sending an email to: <a href="mailto:team.tukoo@gmail.com" data-i18n="footer_email">team.tukoo@gmail.com</a>',
    priv_h2_8: '<span class="legal-num">8.</span> Security',
    priv_p12: 'Reasonable security measures are applied to protect personal data against unauthorized access.',
    priv_update: 'Last updated: 09/12/2025',

    /* LEGAL: terminos (EN) */
    terms_title: 'Terms of use',
    terms_intro: 'Access to and use of the Tuko website are subject to the following terms:',
    terms_h2_1: '<span class="legal-num">1.</span> Purpose',
    terms_p1: 'The Tuko website provides information about our group buying system and allows stores to contact us through a form.',
    terms_h2_2: '<span class="legal-num">2.</span> Permitted use',
    terms_p2: 'The user agrees to:',
    terms_li1: 'Not use the website for unlawful purposes',
    terms_li2: 'Not attempt to damage, overload or disable the platform',
    terms_li3: 'Provide accurate information in forms',
    terms_h2_3: '<span class="legal-num">3.</span> Services offered',
    terms_p3: 'Tuko is currently in an early stage. No service contract is yet formalized through this website. The form serves solely as a point of contact.',
    terms_h2_4: '<span class="legal-num">4.</span> Intellectual property',
    terms_p4: 'All website content (text, design, images, trademarks) belongs to Tuko or is used with permission. Reproduction without consent is not permitted.',
    terms_h2_5: '<span class="legal-num">5.</span> Disclaimer',
    terms_p5: 'The website is provided \u201cas is\u201d. We do not guarantee continuous availability, absence of errors or compatibility with all devices. We are not liable for damages arising from the use or inability to use the website.',
    terms_h2_6: '<span class="legal-num">6.</span> Personal data',
    terms_p6: 'The processing of personal data is governed by our <a href="privacidad.html" target="_blank">Privacy Policy</a>.',
    terms_h2_7: '<span class="legal-num">7.</span> Modifications',
    terms_p7: 'Tuko may modify these terms at any time. Continued use after changes implies acceptance.',
    terms_h2_8: '<span class="legal-num">8.</span> Contact',
    terms_p8: 'For any questions, write to: <a href="mailto:team.tukoo@gmail.com" data-i18n="footer_email">team.tukoo@gmail.com</a>',
  }
};

function broadcastDemoLang(lang) {
  document.querySelectorAll('iframe.how-step-iframe').forEach((iframe) => {
    try {
      const w = iframe.contentWindow;
      if (w) w.postMessage({ type: 'tuko-demo-lang', lang: lang }, '*');
    } catch (e) {
      /* cross-origin u otro */
    }
  });
}

function initDemoIframeLangSync() {
  document.querySelectorAll('iframe.how-step-iframe').forEach((iframe) => {
    iframe.addEventListener('load', () => {
      try {
        const current = localStorage.getItem('tuko_lang') || 'es';
        iframe.contentWindow.postMessage({ type: 'tuko-demo-lang', lang: current }, '*');
      } catch (e) {}
    });
  });
}

function postDemoPlayState(iframe, play) {
  try {
    const w = iframe.contentWindow;
    if (w) w.postMessage({ type: play ? 'tuko-demo-play' : 'tuko-demo-pause' }, '*');
  } catch (e) {}
}

/** Altura del demo 03 (stack móvil) = contenido real, sin hueco vacío abajo */
function initDemoIframeHugHeight() {
  window.addEventListener('message', function (ev) {
    const data = ev.data;
    if (!data || data.type !== 'tuko-demo-resize' || !data.height) return;
    const h = Math.round(Number(data.height));
    if (!Number.isFinite(h) || h < 200) return;

    document.querySelectorAll('iframe.how-step-iframe').forEach(function (iframe) {
      try {
        if (iframe.contentWindow !== ev.source) return;
        const box = iframe.closest('.how-anim-box--embed');
        if (!box) return;
        /* Solo abrazar en viewport estrecho (stack vertical del 03) */
        if (window.matchMedia('(max-width: 960px)').matches) {
          box.classList.add('is-hug');
          box.style.setProperty('--demo-hug-h', h + 'px');
          box.style.height = h + 'px';
          box.style.aspectRatio = 'auto';
          box.style.minHeight = '0';
        } else {
          box.classList.remove('is-hug');
          box.style.removeProperty('--demo-hug-h');
          box.style.height = '';
          box.style.aspectRatio = '';
          box.style.minHeight = '';
        }
      } catch (e) {}
    });
  });

  window.addEventListener('resize', function () {
    if (window.matchMedia('(max-width: 960px)').matches) return;
    document.querySelectorAll('.how-steps > .how-step:nth-child(3) .how-anim-box--embed').forEach(function (box) {
      box.classList.remove('is-hug');
      box.style.removeProperty('--demo-hug-h');
      box.style.height = '';
      box.style.aspectRatio = '';
      box.style.minHeight = '';
    });
  });
}

/** Arranca/pausa demos (p. ej. stats del paso 4) cuando el iframe entra en viewport. */
function initDemoIframeVisibility() {
  const iframes = document.querySelectorAll('iframe.how-step-iframe');
  if (!iframes.length || !('IntersectionObserver' in window)) return;

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        // Umbral bajo: con cards altas a veces no llegaba a 0.3 y nunca enviaba play
        postDemoPlayState(entry.target, entry.isIntersecting && entry.intersectionRatio >= 0.12);
      });
    },
    { threshold: [0, 0.12, 0.25, 0.5], rootMargin: '0px 0px -8% 0px' }
  );

  iframes.forEach((iframe) => {
    io.observe(iframe);
    iframe.addEventListener('load', () => {
      const rect = iframe.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      const visible = rect.bottom > vh * 0.15 && rect.top < vh * 0.85;
      if (visible) postDemoPlayState(iframe, true);
    });
  });
}

/* Idioma: path /en gana; si no, ?lang; si no, localStorage. */
function resolveLang() {
  var path = (location.pathname || '').replace(/\/$/, '') || '/';
  if (path === '/en' || path.indexOf('/en/') === 0) return 'en';
  var q = new URLSearchParams(location.search).get('lang');
  if (q === 'es' || q === 'en') return q;
  return localStorage.getItem('tuko_lang') || 'es';
}

/* No reescribir SEO en URLs reales /en/. */
function syncSeoLang(lang) {
  var root = document.documentElement;
  if (root.getAttribute('data-url-es') && root.getAttribute('data-url-en')) return;
  var path = (location.pathname || '').replace(/\/$/, '') || '/';
  if (path === '/en' || path.indexOf('/en/') === 0) return;
  var base = location.origin + location.pathname;
  var url  = lang === 'en' ? base + '?lang=en' : base;
  var can = document.querySelector('link[rel="canonical"]');
  if (can) can.setAttribute('href', url);
  var og = document.querySelector('meta[property="og:url"]');
  if (og) og.setAttribute('content', url);
  var loc = document.querySelector('meta[property="og:locale"]');
  if (loc) loc.setAttribute('content', lang === 'en' ? 'en_US' : 'es_ES');
  var alt = document.querySelector('meta[property="og:locale:alternate"]');
  if (alt) alt.setAttribute('content', lang === 'en' ? 'es_ES' : 'en_US');
}

function syncLangThumbs(lang, opts) {
  const instant = opts && opts.instant;
  document.querySelectorAll('.lang-switcher').forEach(sw => {
    const thumb = sw.querySelector('.lang-thumb');
    /* Limpia estilos inline viejos (por si quedó cache) */
    if (thumb) {
      thumb.style.width = '';
      thumb.style.height = '';
      thumb.style.transform = '';
      if (instant) {
        thumb.style.transition = 'none';
        sw.setAttribute('data-active', lang);
        void thumb.offsetWidth;
        thumb.style.transition = '';
        return;
      }
    }
    sw.setAttribute('data-active', lang);
  });
}


function localeNavUrl(lang) {
  var root = document.documentElement;
  var attr = lang === 'en' ? 'data-url-en' : 'data-url-es';
  var url = root.getAttribute(attr);
  if (!url) return null;
  try { return new URL(url, location.origin); } catch (e) { return null; }
}

function setLanguage(lang, opts) {
  if (!translations[lang]) return;
  /* En home con URL /en/ real: navegar en lugar de solo swap JS */
  var dest = localeNavUrl(lang);
  if (dest) {
    var herePath = location.pathname.replace(/\/$/, '') || '/';
    var destPath = dest.pathname.replace(/\/$/, '') || '/';
    if (destPath !== herePath) {
      localStorage.setItem('tuko_lang', lang);
      location.href = dest.href;
      return;
    }
  }
  const animate = !opts || opts.animate !== false;
  const prev = document.documentElement.lang;
  const langChanged = !!prev && prev !== lang;
  const shouldMotion = animate && langChanged && document.getElementById('main-content');

  document.documentElement.lang = lang;
  localStorage.setItem('tuko_lang', lang);

  document.querySelectorAll('.lang-opt').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });
  syncLangThumbs(lang, { instant: !langChanged || (opts && opts.animate === false) });

  const apply = () => {
    const t = translations[lang];

    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (!t[key]) return;
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        el.placeholder = t[key];
      } else {
        el.innerHTML = t[key];
      }
    });

    setVideoLang(lang);
    syncSeoLang(lang);
    broadcastDemoLang(lang);
    if (typeof window.tukoEnsureHeroEmArc === 'function') window.tukoEnsureHeroEmArc();
    if (typeof window.tukoRefreshHeroStats === 'function') window.tukoRefreshHeroStats();
    if (typeof window.tukoSyncWidgetGoals === 'function') window.tukoSyncWidgetGoals();
  };

  if (!shouldMotion) {
    apply();
    return;
  }

  document.body.classList.add('lang-switching');
  window.setTimeout(() => {
    apply();
    window.requestAnimationFrame(() => {
      document.body.classList.remove('lang-switching');
    });
  }, 180);
}

/* El vídeo comercial existe en dos idiomas: se muestra el que toca */
function setVideoLang(lang) {
  const box = document.getElementById('tukoVideo');
  if (!box) return;
  const id = box.dataset[lang === 'en' ? 'ytEn' : 'ytEs'];
  if (!id || id === box.dataset.ytId) return;
  box.dataset.ytId = id;

  const iframe = box.querySelector('iframe');
  if (iframe) {
    /* ya estaba reproduciéndose: se cambia sobre la marcha */
    const url = (typeof window.tukoYtEmbedUrl === 'function')
      ? window.tukoYtEmbedUrl(id, true)
      : 'https://www.youtube.com/embed/' + id + '?autoplay=1&rel=0&modestbranding=1&playsinline=1';
    iframe.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
    iframe.src = url;
    return;
  }
  const img = box.querySelector('img');
  if (img) img.src = 'https://i.ytimg.com/vi/' + id + '/maxresdefault.jpg';
}

document.addEventListener('DOMContentLoaded', () => {
  const lang = resolveLang();
  initDemoIframeLangSync();
  initDemoIframeHugHeight();
  initDemoIframeVisibility();
  setLanguage(lang, { animate: false });
  requestAnimationFrame(() => syncLangThumbs(document.documentElement.lang || lang, { instant: true }));

  document.querySelectorAll('.lang-opt').forEach(btn => {
    btn.addEventListener('click', () => setLanguage(btn.dataset.lang));
  });

  window.addEventListener('resize', () => {
    syncLangThumbs(document.documentElement.lang || 'es', { instant: true });
  });
});

/* ── CARRUSEL LOGOS MÓVIL (JS — evita parpadeo iOS/Android) ── */
(function() {
  let rafId = null;
  let visAbort = null;

  function isMobile() { return window.innerWidth < 960; }

  function stopCarousel() {
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    if (visAbort) {
      visAbort.abort();
      visAbort = null;
    }
  }

  function initCarousel() {
    const track = document.querySelector('.logos-track');
    if (!track) return;

    stopCarousel();

    if (!isMobile()) {
      track.style.willChange = '';
      track.style.animation = '';
      track.style.transform = '';
      return;
    }

    track.style.animation = 'none';
    track.style.willChange = 'transform';

    let pos = 0;
    let lastTs = null;
    const SPEED = 58;

    visAbort = new AbortController();
    document.addEventListener('visibilitychange', function() {
      if (document.hidden) lastTs = null;
    }, { signal: visAbort.signal });

    function halfWidth() {
      const w = track.scrollWidth / 2;
      return w > 0 ? w : 1;
    }

    function tick(ts) {
      if (!isMobile()) {
        stopCarousel();
        track.style.willChange = '';
        track.style.animation = '';
        track.style.transform = '';
        return;
      }
      if (lastTs === null) lastTs = ts;
      const dt = Math.min(ts - lastTs, 50);
      lastTs = ts;
      pos += SPEED * dt / 1000;
      const half = halfWidth();
      if (pos >= half) pos -= half;
      track.style.transform = 'translate3d(-' + pos + 'px, 0, 0)';
      rafId = requestAnimationFrame(tick);
    }

    function start() {
      rafId = requestAnimationFrame(tick);
    }

    if (document.readyState === 'complete') {
      start();
    } else {
      window.addEventListener('load', start, { once: true });
    }
  }

  let wasMobile = isMobile();
  window.addEventListener('resize', function() {
    const nowMobile = isMobile();
    if (nowMobile !== wasMobile) {
      wasMobile = nowMobile;
      initCarousel();
    }
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCarousel);
  } else {
    initCarousel();
  }
})();

/* ── HAMBURGER MENU ── */
document.addEventListener('DOMContentLoaded', () => {
  const hamburger  = document.getElementById('navHamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  if (!hamburger || !mobileMenu) return;

  let scrim = document.getElementById('mobileMenuScrim');
  if (!scrim) {
    scrim = document.createElement('div');
    scrim.id = 'mobileMenuScrim';
    scrim.className = 'mobile-menu-scrim';
    scrim.setAttribute('aria-hidden', 'true');
    document.body.appendChild(scrim);
  }

  function toggleMenu(open) {
    hamburger.classList.toggle('open', open);
    mobileMenu.classList.toggle('open', open);
    scrim.classList.toggle('open', open);
    hamburger.setAttribute('aria-expanded', open ? 'true' : 'false');
    mobileMenu.setAttribute('aria-hidden', open ? 'false' : 'true');
    scrim.setAttribute('aria-hidden', open ? 'false' : 'true');
    document.body.style.overflow = open ? 'hidden' : '';
    if (open) {
      requestAnimationFrame(() => {
        syncLangThumbs(document.documentElement.lang || 'es', { instant: true });
      });
    }
  }

  hamburger.addEventListener('click', () => {
    toggleMenu(!hamburger.classList.contains('open'));
  });

  // Cerrar al pulsar cualquier enlace del menú móvil
  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => toggleMenu(false));
  });

  scrim.addEventListener('click', () => toggleMenu(false));

  // Cerrar al pulsar fuera
  document.addEventListener('click', e => {
    if (mobileMenu.classList.contains('open') &&
        !mobileMenu.contains(e.target) &&
        !hamburger.contains(e.target) &&
        e.target !== scrim) {
      toggleMenu(false);
    }
  });
});

/* ── SCROLLSPY: sección activa en header (home) ── */
document.addEventListener('DOMContentLoaded', () => {
  const sectionIds = ['problema', 'como-funciona', 'beneficios'];
  const sections = sectionIds
    .map(id => document.getElementById(id))
    .filter(Boolean);
  if (!sections.length) return;

  const navLinks = Array.from(
    document.querySelectorAll('.nav-links a[href^="#"], #mobileMenu a[href^="#"]')
  ).filter(a => sectionIds.includes((a.getAttribute('href') || '').slice(1)));

  if (!navLinks.length) return;

  function setActive(id) {
    navLinks.forEach(a => {
      const match = a.getAttribute('href') === '#' + id;
      a.classList.toggle('nav-link-active', match);
      if (match) a.setAttribute('aria-current', 'true');
      else a.removeAttribute('aria-current');
    });
  }

  function headerOffset() {
    const header = document.querySelector('header');
    return (header ? header.offsetHeight : 64) + 24;
  }

  function updateSpy() {
    const line = headerOffset();
    let current = '';
    for (let i = 0; i < sections.length; i++) {
      if (sections[i].getBoundingClientRect().top <= line) {
        current = sections[i].id;
      }
    }
    setActive(current);
  }

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      updateSpy();
      ticking = false;
    });
  }, { passive: true });

  navLinks.forEach(a => {
    a.addEventListener('click', () => {
      const id = (a.getAttribute('href') || '').slice(1);
      if (id) setActive(id);
    });
  });

  updateSpy();
});
