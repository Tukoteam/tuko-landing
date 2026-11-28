/**
 * Genera en/drops.html (página EN real) desde drops.html.
 * La página no usa claves de i18n: se traduce con una tabla ES → EN (se aplica de la frase más larga a la más
 * corta, para que una palabra suelta no pise una frase que la contiene). Los textos que pinta el JavaScript
 * (tickets, regla, móvil, calculadora) cambian solos con <html lang="en">.
 * También enlaza las dos versiones (hreflang, data-url-*), añade la URL al sitemap y las redirecciones.
 * Uso: npm run build && npm run generate:en-launches && npm run build
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const site = path.join(repoRoot, 'site');
const srcPath = path.join(site, 'drops.html');
const outPath = path.join(site, 'en', 'drops.html');
const ES_URL = 'https://tukoteam.com/drops';
const EN_URL = 'https://tukoteam.com/en/drops';

const SEO = {
  title: 'Drops and pre-orders on Shopify · Tuko',
  desc: 'Open a drop with a minimum of units and a launch price. Hit it and it completes; miss it and everyone is refunded. From about €9 ($9.90) every 30 days.',
  keywords: 'shopify pre-order, launch a drop, clothing drop, pre-order with goal, shopify crowdfunding, shopify limited edition, sell before you make, shopify product launch, group buying',
  ogTitle: 'Tuko Drops: launch only what already has buyers',
  ogDesc: 'Drops and pre-orders with a minimum of units for your Shopify store. Hit it and it completes. Miss it and everyone is refunded.',
  twDesc: 'Drops and pre-orders with a minimum of units for your Shopify store. Miss it and everyone is refunded.',
};

/* ── Tabla de traducción ── */
const T = [
  // Hero
  ['<b>Drops</b>', '<b>Drops</b>'],
  ['Lanza solo lo que', 'Launch only what'],
  ['ya tiene compradores.', 'already has buyers.'],
  ['Drops, preventas y ediciones limitadas con un mínimo de unidades.', 'Drops, pre-orders and limited editions with a minimum of units.'],
  ['Si se llega al mínimo, el drop sale adelante', 'Hit the minimum and the drop goes ahead'],
  [' y todos se lo llevan con descuento. Si no, se devuelve el dinero a todos.', ' and everyone gets the discount. Miss it and everyone is refunded.'],
  ['Instalar gratis en Shopify', 'Install free on Shopify'],
  ['Ver cómo funciona', 'See how it works'],
  ['Solo pagas si se completa, desde ≈ 9 € · 9,90 $', 'You only pay if it completes, from ≈ €9 · $9.90'],
  ['Desde 3 unidades · de 3 a 60 días', 'From 3 units · 3 to 60 days'],
  ['Lanzamiento · Sudadera Ed. 01', 'Launch · Hoodie Ed. 01'],
  ['30 unidades · Cierra el 15 nov', '30 units · Closes Nov 15'],
  ['>Pedidos ', '>Orders '],
  ['>Quedan <', '>Ends in <'],
  ['Saltar al contenido', 'Skip to content'],

  // Cómo funciona
  ['>Cómo funciona<', '>How it works<'],
  ['Pones las reglas una vez.', 'You set the rules once.'],
  ['El resto va solo.', 'The rest runs itself.'],
  ['Eliges cuántas unidades vendes, el mínimo para que salga adelante, el precio y hasta cuándo. Tuko se encarga del resto.', 'You choose how many units you sell, the minimum for it to go ahead, the price and the deadline. Tuko takes care of the rest.'],
  ['Sudadera Ed. 01', 'Hoodie Ed. 01'],
  ['<em>Unidades</em>30', '<em>Units</em>30'],
  ['<em>Precio</em>39 €', '<em>Price</em>€39'],
  ['<em>Plazo</em>12 días', '<em>Deadline</em>12 days'],
  ['<em>30 pedidos × 39 €</em><b>1.170 €</b>', '<em>30 orders × €39</em><b>€1,170</b>'],
  ['Completado · día 9', 'Complete · day 9'],
  ['>Repetir<', '>Replay<'],
  ['de 30 unidades', 'of 30 units'],
  ['de un mínimo de 40', 'of a minimum of 40'],
  ['Día <b class="lz-flow-d">1</b> de 12', 'Day <b class="lz-flow-d">1</b> of 12'],
  ['<b>Completado</b><small>3 días antes</small>', '<b>Completed</b><small>3 days early</small>'],
  ['Lo abres', 'You open it'],
  ['Eliges el producto, cuántas unidades vendes, el mínimo, el precio y hasta cuándo.', 'Pick the product, how many units you sell, the minimum, the price and the deadline.'],
  ['Precompran', 'They pre-order'],
  ['Cada cliente paga al precomprar. Tú solo compartes el enlace.', 'Each customer pays when they pre-order. All you do is share the link.'],
  ['<h3>Se completa</h3>', '<h3>It completes</h3>'],
  ['Si se agota, se cierra antes; si al final llega al mínimo, preparas los pedidos.', 'If it sells out it closes early; if it reaches the minimum by the end, you prepare the orders.'],

  // Dos finales
  ['Al cerrar', 'At the close'],
  ['Solo puede acabar de dos maneras.', 'It can only end two ways.'],
  ['Las dos te sirven.', 'Both work for you.'],
  ['Cierre · 12 nov · 18:42', 'Closed · Nov 12 · 18:42'],
  ['Cierre · 22 nov · 23:59', 'Closed · Nov 22 · 23:59'],
  ['Lanzamiento Nº 07 · Sudadera Ed. 01', 'Launch No. 07 · Hoodie Ed. 01'],
  ['Lanzamiento Nº 08 · Taza Ed. Otoño', 'Launch No. 08 · Autumn Ed. Mug'],
  ['<em>Precio de lanzamiento</em><b>39 € × 30</b>', '<em>Launch price</em><b>€39 × 30</b>'],
  ['<em>Ventas</em><b>1.170 €</b>', '<em>Sales</em><b>€1,170</b>'],
  ['<em>Ahorro de tus clientes</em><b>300 €</b>', '<em>Your customers save</em><b>€300</b>'],
  ['<em>Tuko · hasta 30 unidades</em><b>≈ 9 €</b>', '<em>Tuko · up to 30 units</em><b>≈ €9</b>'],
  ['<em>Devuelto por 26 unidades</em><b>468 €</b>', '<em>Refunded for 26 units</em><b>€468</b>'],
  ['<em>Stock que nadie ha pedido</em>', '<em>Stock nobody ordered</em>'],
  ['<em>Tuko</em><b>0 €</b>', '<em>Tuko</em><b>€0</b>'],
  ['>Devuelto<', '>Refunded<'],
  ['<b>Se completa.</b> Todos se lo llevan al precio de lanzamiento y sabes cuántas unidades preparar, talla por talla.',
    '<b>It completes.</b> Everyone gets it at the launch price and you know exactly how many to make, size by size.'],
  ['<b>No se llega.</b> Se devuelve el dinero a todos y no te quedas con stock que nadie ha pedido. Ya sabes qué no sacar.',
    '<b>It falls short.</b> Everyone gets their money back and you’re not left with stock nobody ordered. Now you know what not to make.'],

  // Para quién
  ['Para quién', 'Who it’s for'],
  ['Para lo que no quieres', 'For the things you’d rather not'],
  ['sacar a ciegas.', 'launch blind.'],
  ['Te sirve si…', 'It’s for you if…'],
  ['Produces por tandas o ediciones', 'You make things in batches or editions'],
  ['No sabes cuántas unidades pedir (ni de qué talla)', 'You’re not sure how many to order (or in which sizes)'],
  ['Tienes gente que te sigue y espera lo próximo', 'You have followers waiting for what’s next'],
  ['¿Ninguna? Puede que te baste una venta normal.', 'None of these? A regular sale may be all you need.'],
  ['Ropa y streetwear', 'Apparel and streetwear'],
  ['Tu drop con fecha y objetivo. Al completarse sabes cuántas S, M, L y XL te han pedido: ni una talla de más en el almacén.',
    'Your drop, with a date and a goal. When it completes you know how many S, M, L and XL were ordered: not one extra size in the warehouse.'],
  ['Cosmética y cuidado', 'Beauty and skincare'],
  ['>Novedades<', '>New products<'],
  ['Prueba una novedad antes de pedir el mínimo al laboratorio. Si tu comunidad no responde, lo sabes antes de pedirlo.',
    'Test a new product before you place the lab’s minimum order. If your community doesn’t bite, you know before you order it.'],
  ['Hogar, cerámica y artesanía', 'Home, ceramics and crafts'],
  ['Ediciones pequeñas', 'Small batches'],
  ['Una hornada cuesta casi lo mismo con 10 piezas que con 40. Con un lanzamiento la llenas antes de encender el horno.',
    'A kiln firing costs almost the same with 10 pieces as with 40. A launch fills it before you switch it on.'],
  ['Creadores y merch', 'Creators and merch'],
  ['>Preventas<', '>Pre-orders<'],
  ['Tu comunidad vota con la compra, no con likes. Compartes el enlace en tus redes y el contador hace el resto.',
    'Your community votes with purchases, not likes. Share the link on your socials and the counter does the rest.'],

  // Frente a una preventa
  ['Frente a una preventa', 'Versus a pre-order'],
  ['No es una preventa más.', 'It’s not just another pre-order.'],
  ['Es una preventa con red.', 'It’s a pre-order with a safety net.'],
  ['Preventa normal frente a lanzamiento con Tuko', 'Regular pre-order versus launch with Tuko'],
  ['>Situación<', '>Situation<'],
  ['>Preventa normal<', '>Regular pre-order<'],
  ['Lanzamiento con Tuko', 'Launch with Tuko'],
  ['Si no se vende lo suficiente', 'If it doesn’t sell enough'],
  ['Fabricas y envías igual, o devuelves a mano, pedido a pedido.', 'You make and ship anyway, or refund by hand, order by order.'],
  ['Se devuelve el 100 % a todos, sin que hagas nada.', 'Everyone gets 100% back, without you lifting a finger.'],
  ['Cuándo sabes cuánto preparar', 'When you know how much to make'],
  ['Al cerrar, sumando pedidos en una hoja de cálculo.', 'At the end, adding up orders in a spreadsheet.'],
  ['En directo, con las unidades de cada talla en tu panel.', 'Live, with units per size in your dashboard.'],
  ['>Qué ve tu cliente<', '>What your customer sees<'],
  ['«Disponible en unas semanas» y mucha fe.', '“Available in a few weeks” and a lot of faith.'],
  ['Cuántas unidades quedan, cuándo cierra, cuándo se envía y qué pasa si no sale adelante.', 'How many units are left, when it closes, when it ships and what happens if it doesn’t go ahead.'],
  ['Quién lo mueve', 'Who spreads the word'],
  ['Tú, y nadie más.', 'You, and only you.'],
  ['Tú y cada comprador, que lo comparte con quien le pueda gustar.', 'You and every buyer, who shares it with anyone who might like it.'],

  // Mini-diagramas de la comparativa
  ['data-done="Completado"', 'data-done="Complete"'],
  ['<small>3 sin vender</small>', '<small>3 unsold</small>'],
  ['<b>100 %</b><small>devuelto, solo</small>', '<b>100%</b><small>refunded, automatically</small>'],
  ['<small>en directo</small>', '<small>live</small>'],
  ['<span>Disponible en unas semanas</span>', '<span>Available in a few weeks</span>'],
  ['<span class="mv-of">de 30</span>', '<span class="mv-of">of 30</span>'],
  ['>Tú</i>', '>You</i>'],

  // Lo que ve tu cliente
  ['Lo que ve tu cliente', 'What your customer sees'],
  ['Tus clientes saben en todo momento', 'Your customers always know'],
  ['cuánto queda.', 'how many are left.'],
  ['En la ficha del producto, el botón de compra se cambia por el del drop: precio, unidades que quedan, cuenta atrás y cuándo se envía. Los emails del pedido y de la devolución les llegan de tu tienda, como siempre.', 'On the product page, the buy button becomes the drop button: price, units left, a countdown and when it ships. Order and refund emails come from your store, as always.'],
  ['<span>Al pagar</span>', '<span>When they pay</span>'],
  ['Tu precompra está hecha', 'Your pre-order is in'],
  ['Cuando quedan 12 horas', 'With 12 hours to go'],
  ['Cierra en 12 horas', 'Closes in 12 hours'],
  ['Cuando quedan pocas', 'When few are left'],
  ['Solo queda 1 unidad', 'Only 1 unit left'],
  ['o, si no sale adelante, la devolución del 100 %', 'or, if it doesn’t go ahead, a 100% refund'],
  ['Drop completado', 'Drop complete'],
  ['>ahora<', '>now<'],

  // Móvil: Tuko Store, el widget del drop y su popup
  ['<b>39,00 €</b><s>49,00 €</s>', '<b>€39.00</b><s>€49.00</s>'],
  ['Precio especial de drop', 'Special drop price'],
  ['Este drop se completó', 'This drop filled up'],
  ['Se vendió a <b>39,00 €</b>', 'Sold at <b>€39.00</b>'],
  ['>Completo<', '>Complete<'],
  ['Cierra en', 'Closes in'],
  ['<em>días</em>', '<em>days</em>'],
  ['<em>horas</em>', '<em>hours</em>'],
  ['Solo quedan <b class="lzp-left">13</b> unidades', 'Only <b class="lzp-left">13</b> units left'],
  ['Se llegó a 30 unidades', '30 units reached'],
  ['Precomprar', 'Pre-order'],
  ['Ver detalles', 'See details'],
  ['Preventa · Se envía a partir de febrero', 'Pre-order · Ships from February'],
  ['Precompra hecha', 'Pre-order placed'],
  ['Ya es tuyo. Se envía a partir de febrero y, si el drop no sale adelante, te devolvemos el 100 %.', 'It’s yours. It ships from February and, if the drop doesn’t go ahead, you get 100% back.'],
  ['<span class="lzp-s-tag">Completado</span>', '<span class="lzp-s-tag">Complete</span>'],
  ['¡Ya tienes el tuyo! La tienda lo prepara y te lo envía.', 'Yours is secured! The store will prepare it and ship it to you.'],
  ['<s>49,00 €</s> 39,00 €', '<s>€49.00</s> €39.00'],

  // Precio
  ['<p class="lz-eyebrow">Precio</p>', '<p class="lz-eyebrow">Pricing</p>'],
  ['Pagas cuando vendes.', 'You pay when you sell.'],
  ['Ni un céntimo antes.', 'Not a cent before.'],
  ['<b>≈ 9 €</b><span>9,90 $ cada 30 días, hasta 30 unidades</span>', '<b>≈ €9</b><span>$9.90 every 30 days, up to 30 units</span>'],
  ['Solo cuentan los drops que se completan. Si no se llega, <b>no le pagas nada a Tuko</b>.', 'Only drops that complete count. If it falls short, <b>you pay Tuko nothing</b>.'],
  ['Tu primer drop es gratis. Después, un tramo cada 30 días: hasta 60 unidades, ≈ 18 € (19,80 $); hasta 100, ≈ 32 € (35,20 $); hasta 200, ≈ 55 € (59,40 $)', 'Your first drop is free. After that, one tier every 30 days: up to 60 units, ≈ €18 ($19.80); up to 100, ≈ €32 ($35.20); up to 200, ≈ €55 ($59.40)'],
  ['Nunca más de ≈ 82 € (89,10 $) cada 30 días, vendas lo que vendas', 'Never more than ≈ €82 ($89.10) every 30 days, however much you sell'],
  ['Sin cuota fija y sin comisión sobre tus ventas', 'No fixed fee and no commission on your sales'],
  ['Haz la cuenta', 'Run the numbers'],
  ['Unidades vendidas en el drop', 'Units sold in the drop'],
  ['<em>Precio con tu descuento</em>', '<em>Price with your discount</em>'],
  ['Lo que paga cada unidad, ya con el descuento que eliges.', 'What each unit costs, with the discount you choose already applied.'],
  ['Precio con tu descuento, en euros', 'Price with your discount, in euros'],
  ['<b class="lz-calc-p">39 €</b>', '<b class="lz-calc-p">€39</b>'],
  ['<em>Vendes</em><b class="lz-calc-sales">1.170 €</b>', '<em>You sell</em><b class="lz-calc-sales">€1,170</b>'],
  ['<em>Pagas a Tuko</em><b class="lz-calc-fee">≈ 9 € · 9,90 $</b>', '<em>You pay Tuko</em><b class="lz-calc-fee">≈ €9 · $9.90</b>'],
  ['<em>Te quedas</em><b class="lz-calc-keep">≈ 1.161 €</b>', '<em>You keep</em><b class="lz-calc-keep">≈ €1,161</b>'],
  ['<em>Tú</em>', '<em>You</em>'],
  ['De cada 100 € que vendes, Tuko se lleva <b class="lz-calc-pct">≈ 0,8 €</b>', 'Out of every €100 you sell, Tuko takes <b class="lz-calc-pct">≈ €0.8</b>'],
  ['Se devuelve el dinero a todos. Tuko: <b>0 €</b>', 'Everyone is refunded. Tuko: <b>€0</b>'],
  ['¿Y si no se completa?', 'What if it doesn’t complete?'],
  ['Con un solo drop en los 30 días (el tramo suma lo que vendes con grupos y drops). Si es tu primer drop, es gratis. Shopify cobra a Tuko en dólares; los euros son aproximados. Sin IVA ni la comisión de tu pasarela de pago.', 'With a single drop in the 30 days (the tier adds up what you sell with groups and drops). If it’s your first drop, it’s free. Shopify bills Tuko in US dollars; euro amounts are approximate. Excludes VAT and your payment provider’s fee.'],
  ['Precio de lanzamiento', 'Launch price'],

  // Preguntas
  ['<p class="lz-eyebrow">Preguntas</p>', '<p class="lz-eyebrow">Questions</p>'],
  ['Lo que se pregunta', 'What people ask'],
  ['antes de lanzar.', 'before launching.'],
  ['¿Cuándo se cobra a mis clientes?', 'When are my customers charged?'],
  ['Al precomprar, en el checkout normal de tu tienda y al precio de lanzamiento. El pedido queda retenido hasta que el drop se cierra.', 'When they pre-order, in your store’s normal checkout and at the launch price. The order is held until the drop closes.'],
  ['¿Y si no se llega al mínimo?', 'What if it doesn’t reach the minimum?'],
  ['Se devuelve el 100 % a todos y les llega el email de devolución de tu tienda. Tú no tienes que hacer nada. Según el banco, el dinero tarda entre 3 y 10 días en aparecer.', 'Everyone gets 100% back and receives your store’s refund email. You don’t have to do anything. Depending on the bank, the money takes 3 to 10 days to show up.'],
  ['¿Qué pasa si se agota antes de la fecha?', 'What if it sells out before the deadline?'],
  ['Se cierra en ese momento y los pedidos siguen adelante. Si llega al mínimo antes de la fecha, sigue abierto hasta agotarse o hasta la fecha de cierre.', 'It closes right then and the orders go ahead. If it reaches the minimum before the deadline, it stays open until it sells out or the deadline arrives.'],
  ['¿Funciona con tallas y variantes?', 'Does it work with sizes and variants?'],
  ['Sí. Cada cliente elige su variante y puede comprar hasta 10 unidades por pedido. En tu panel ves cuántas unidades hay de cada talla o variante.', 'Yes. Each customer picks their variant and can buy up to 10 units per order. Your dashboard shows how many units there are of each size or variant.'],
  ['¿Cambia algo en mi tema de Shopify?', 'Does it change anything in my Shopify theme?'],
  ['Solo en la ficha de ese producto: el botón de compra del tema se sustituye por el del lanzamiento. El resto de tu tienda queda igual.',
    'Only on that product’s page: the theme’s buy button is replaced by the launch button. The rest of your store stays the same.'],
  ['¿Puede un cliente echarse atrás?', 'Can a customer back out?'],
  ['Sí, mientras el drop siga abierto. Se le devuelve el 100 % y su unidad vuelve a quedar a la venta.', 'Yes, while the drop is still open. They get 100% back and their unit goes back on sale.'],
  ['¿Qué límites tiene?', 'What are the limits?'],
  ['Desde 3 unidades, con un máximo o sin límite, de 3 a 60 días y un descuento de 0 a 90 % sobre tu precio normal (puedes no poner ninguno).', 'From 3 units, with a maximum or no limit, 3 to 60 days and a discount of 0 to 90% off your regular price (you can leave it at zero).'],

  // Preguntas por momento
  ['Preguntas por momento del lanzamiento', 'Questions by launch moment'],
  ['Antes de abrir', 'Before you open'],
  ['Mientras está abierto', 'While it’s open'],
  ['¿Y qué pasa con los pedidos si se completa?', 'And what happens to the orders if it completes?'],
  ['Los pedidos retenidos se liberan y siguen en tu Shopify como cualquier otro: los preparas y los envías como siempre. Cada pedido indica desde qué mes se envía.', 'The held orders are released and stay in your Shopify like any other: you pack and ship them as usual. Each order shows the month it ships from.'],
  ['<b>2 min</b><em>para instalarlo, sin tocar tu tema</em>', '<b>2 min</b><em>to install, no theme edits</em>'],
  ['<b>Por talla</b><em>ves cuántas de cada una</em>', '<b>By size</b><em>see how many of each</em>'],
  ['<b>Al pagar</b><em>en tu checkout</em>', '<b>On payment</b><em>in your checkout</em>'],
  ['<em>si se echa atrás</em>', '<em>if they back out</em>'],
  ['<b>Sin esperar</b><em>a la fecha de cierre</em>', '<b>No waiting</b><em>for the closing date</em>'],
  ['<em>devuelto, en 3–10 días</em>', '<em>refunded, in 3–10 days</em>'],
  ['<em>pedidos de siempre</em>', '<em>orders as usual</em>'],

  // Cierre
  ['Lanzamiento Nº 10', 'Launch No. 10'],
  ['El siguiente', 'The next one'],
  ['es el tuyo.', 'is yours.'],
  ['Instálalo gratis, elige un producto y ábrelo hoy. Si no se completa, no le pagas nada a Tuko.', 'Install it for free, pick a product and open it today. If it doesn’t complete, you pay Tuko nothing.'],
  ['>Ver el precio<', '>See pricing<'],

  // Cierre: tu impresora
  ['>Tu turno<', '>Your turn<'],
  ['aria-label="Tu lanzamiento"', 'aria-label="Your launch"'],
  ['Tu producto<i class="lzf-caret">', 'Your product<i class="lzf-caret">'],
  ['<em>A la venta</em><b><span class="lzf-goal">30</span> unidades</b>', '<em>On sale</em><b><span class="lzf-goal">30</span> units</b>'],
  ['<em>Pedidos</em><b>0 de <span class="lzf-goal">30</span></b>', '<em>Orders</em><b>0 of <span class="lzf-goal">30</span></b>'],
  ['<em>Tuko, hasta que se complete</em><b>0 €</b>', '<em>Tuko, until it completes</em><b>€0</b>'],
  ['<span>Pedidos</span><b>00</b>', '<span>Orders</span><b>00</b>'],
  ['<span class="lzf-silk">Unidades</span>', '<span class="lzf-silk">Units</span>'],
  ['aria-label="Menos unidades"', 'aria-label="Fewer units"'],
  ['aria-label="Más unidades"', 'aria-label="More units"'],

  // Palabras sueltas (al final por ser las más cortas)
  ['>Completado<', '>Complete<'],
  // Precios por tramos (términos 9.6)
  ['<em>Unidades</em>', '<em>Units</em>'],
  // Drops: mínimo, unidades y preventa
  ['<span class="lzp-msg">Pedido #1043 confirmado</span>', '<span class="lzp-msg">Order #1043 confirmed</span>'],
  ['<b>3+</b><em>unidades</em>', '<b>3+</b><em>units</em>'],
  // Móvil: tarjeta real y checkout
  ['Solo 30 unidades', 'Only 30 units'],
  ['Si el drop no sale adelante, te devolvemos el 100 %. <u>Condiciones</u>', 'If the drop doesn’t go ahead, you get 100% back. <u>Terms</u>'],
  ['Pago seguro', 'Secure checkout'],
  ['M · Preventa: se envía a partir de febrero', 'M · Pre-order: ships from February'],
  ['<em>Subtotal</em><b>39,00 €</b>', '<em>Subtotal</em><b>€39.00</b>'],
  ['<em>Total</em><b>39,00 €</b>', '<em>Total</em><b>€39.00</b>'],
  ['<b class="lzp-co-amt">39,00 €</b>', '<b class="lzp-co-amt">€39.00</b>'],
  ['<p class="lzp-co-k">Contacto</p>', '<p class="lzp-co-k">Contact</p>'],
  ['<p class="lzp-co-k">Pago</p>', '<p class="lzp-co-k">Payment</p>'],
  ['>Pagar ahora<', '>Pay now<'],
];

function translate(html) {
  // Solo entre <body> y </body>: la cabecera se reescribe aparte
  const a = html.indexOf('<body');
  const b = html.lastIndexOf('</body>');
  let body = html.slice(a, b);
  const pairs = [...T].sort((x, y) => y[0].length - x[0].length);
  const missing = [];
  for (const [es, en] of pairs) {
    if (!body.includes(es)) { missing.push(es); continue; }
    body = body.split(es).join(en);
  }
  if (missing.length) console.warn('No encontrados (revisa si el texto ES cambió):\n - ' + missing.join('\n - '));
  return html.slice(0, a) + body + html.slice(b);
}

function jsonLd(html) {
  const qa = [...html.matchAll(/<summary><span>([^<]+)<\/span>[\s\S]*?<p>([^<]+)<\/p>/g)].map((m) => ({
    '@type': 'Question',
    name: m[1],
    acceptedAnswer: { '@type': 'Answer', text: m[2] },
  }));
  const data = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${EN_URL}#webpage`,
        url: EN_URL,
        name: 'Drops and pre-orders with a minimum of units on Shopify',
        description: SEO.desc,
        inLanguage: 'en',
        isPartOf: { '@id': 'https://tukoteam.com/#website' },
        publisher: { '@id': 'https://tukoteam.com/#organization' },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://tukoteam.com/en/' },
          { '@type': 'ListItem', position: 2, name: 'Drops', item: EN_URL },
        ],
      },
      { '@type': 'FAQPage', '@id': `${EN_URL}#faq`, mainEntity: qa },
    ],
  };
  return html.replace(
    /<script type="application\/ld\+json">[\s\S]*?<\/script>/,
    `<script type="application/ld+json">\n${JSON.stringify(data, null, 2)}\n</script>`
  );
}

function patchHead(html) {
  let h = html;
  const attr = (s) => s.replace(/"/g, '&quot;');
  h = h.replace(/<html\b[^>]*>/, `<html lang="en" data-url-es="${ES_URL}" data-url-en="${EN_URL}">`);
  h = h.replace(/<title>[^<]*<\/title>/, `<title>${SEO.title}</title>`);
  h = h.replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${attr(SEO.desc)}">`);
  h = h.replace(/<meta name="keywords" content="[^"]*">/, `<meta name="keywords" content="${attr(SEO.keywords)}">`);
  h = h.replace(/<link rel="canonical" href="[^"]*">/, `<link rel="canonical" href="${EN_URL}">`);
  h = h.replace(/property="og:url" content="[^"]*"/, `property="og:url" content="${EN_URL}"`);
  h = h.replace(/property="og:title" content="[^"]*"/, `property="og:title" content="${attr(SEO.ogTitle)}"`);
  h = h.replace(/property="og:description" content="[^"]*"/, `property="og:description" content="${attr(SEO.ogDesc)}"`);
  h = h.replace(/property="og:locale" content="es_ES"/, 'property="og:locale" content="en_US"');
  h = h.replace(/property="og:locale:alternate" content="en_US"/, 'property="og:locale:alternate" content="es_ES"');
  h = h.replace(/name="twitter:title" content="[^"]*"/, `name="twitter:title" content="${attr(SEO.ogTitle)}"`);
  h = h.replace(/name="twitter:description" content="[^"]*"/, `name="twitter:description" content="${attr(SEO.twDesc)}"`);
  return jsonLd(h);
}

function hreflang(html) {
  const block = [
    `<link rel="alternate" hreflang="es" href="${ES_URL}">`,
    `<link rel="alternate" hreflang="en" href="${EN_URL}">`,
    `<link rel="alternate" hreflang="x-default" href="${ES_URL}">`,
  ].join('\n');
  return html.replace(/(<link rel="alternate" hreflang="[^"]+" href="[^"]*">\r?\n?)+/, block + '\n');
}

function enChrome(html) {
  let h = html;
  // Rutas relativas (iconos, etc.) desde /en/
  h = h.replace(/(\b(?:href|src)=["'])((?:assets|blog|pages|index\.html)[^"']*)(["'])/g, '$1../$2$3');
  h = h.replace(/locale=es/g, 'locale=en');
  h = h.replace(/tuko:partial:nav-es/g, 'tuko:partial:nav-en');
  h = h.replace(/tuko:partial:footer-es/g, 'tuko:partial:footer-en');
  h = h.replace(/(<button type="button" class="lang-opt) active(" data-lang="es")/g, '$1$2');
  h = h.replace(/(<button type="button" class="lang-opt)(" data-lang="en")/g, '$1 active$2');
  h = h.replace(/data-active="es"/g, 'data-active="en"');
  return h;
}

function ensureSitemap() {
  const p = path.join(site, 'sitemap.xml');
  let sm = fs.readFileSync(p, 'utf8');
  if (sm.includes(`<loc>${EN_URL}</loc>`)) return;
  const entry = `  <url>\n    <loc>${EN_URL}</loc>\n    <lastmod>${new Date().toISOString().slice(0, 10)}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.85</priority>\n  </url>\n`;
  sm = sm.replace(/(<url>\s*<loc>https:\/\/tukoteam\.com\/drops<\/loc>[\s\S]*?<\/url>\r?\n)/, `$1${entry}`);
  fs.writeFileSync(p, sm);
}

function ensureRedirects() {
  const p = path.join(repoRoot, 'netlify.toml');
  let n = fs.readFileSync(p, 'utf8');
  if (n.includes('from = "/en/drops"')) return;
  n = n.replace(
    /(\[\[redirects\]\]\r?\n  from = "\/en\/tuko-ai"\r?\n)/,
    `# Drops (EN): URL limpia\n[[redirects]]\n  from = "/en/drops.html"\n  to = "/en/drops"\n  status = 301\n  force = true\n\n[[redirects]]\n  from = "/en/drops"\n  to = "/en/drops.html"\n  status = 200\n  force = true\n\n$1`
  );
  fs.writeFileSync(p, n);
}

// ── main ──
const es = fs.readFileSync(srcPath, 'utf8');
let en = translate(es);
en = patchHead(en);
en = hreflang(en);
en = enChrome(en);
fs.writeFileSync(outPath, en);
console.log('wrote', path.relative(repoRoot, outPath));

// La versión ES enlaza a la EN
let esOut = es.replace(/<html lang="es"[^>]*>/, `<html lang="es" data-url-es="${ES_URL}" data-url-en="${EN_URL}">`);
esOut = hreflang(esOut);
fs.writeFileSync(srcPath, esOut);
console.log('patched drops.html (hreflang + data-url-en)');

ensureSitemap();
ensureRedirects();
console.log('DONE');
