/* ═══════════════════════════════════════════════════
   MOTOR VIRAL DE CONTENIDO OSCURO — API Serverless
   Público objetivo: Latinoamérica y España
   ═══════════════════════════════════════════════════ */

const Anthropic = require('@anthropic-ai/sdk');
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const PROMPTS = {

  story: ({ category, tone, length, angle }) => `
Eres un maestro narrador de historias oscuras para una página de Facebook con 230.000 seguidores latinoamericanos.
Escribí una historia viral de ${category} con estas especificaciones:

TONO: ${tone}
EXTENSIÓN: ${length}
${angle ? `ÁNGULO/GIRO: ${angle}` : ''}

Usá exactamente estos encabezados:

### TÍTULO VIRAL
Un título que detenga el scroll. Que genere curiosidad o impacto inmediato.

### GANCHO INICIAL
2-3 oraciones. Hecho perturbador, afirmación impactante o pregunta escalofriante. Tiene que atrapar desde la primera línea.

### HISTORIA
La historia completa. Párrafos cortos (2-3 oraciones). Construí tensión progresiva. Detalles sensoriales. Atmósfera de pavor. Usá referencias culturales latinoamericanas cuando sea relevante.

### FINAL CON CLIFFHANGER
Terminá con una línea que dispare comentarios, por ejemplo:
"¿Querés saber qué pasó después? Comentá PARTE 2."
o "Lo peor de todo es que esto acaba de empezar. Comentá CONTINUAR."

Escribí en un tono periodístico mezclado con horror. Que sea imposible dejar de leer. Todo en español latino, natural y fluido.`,

  script: ({ platform, genre, duration, topic }) => `
Sos un guionista viral de videos cortos especializado en terror y crimen real para público latinoamericano.
Creá un guión de ${duration} para ${platform} sobre ${topic || `una historia de ${genre}`}.

Usá exactamente estos encabezados:

### GANCHO (0-3 segundos)
La frase de apertura que detiene el scroll. Tiene que generar curiosidad o impacto instantáneo.

### GUIÓN DE NARRACIÓN
El texto completo de narración. Oraciones CORTAS. Contundentes. Indicá pausas dramáticas con [PAUSA].
Cada línea debe sonar natural al hablar en voz alta. Uso natural del español latinoamericano.

### SUGERENCIAS DE ESCENAS
Lista con viñetas de sugerencias visuales para cada segmento (fondo, B-roll, texto en pantalla).

### NOTAS DE RITMO
Notas sobre tiempos, pausas, estilo musical y tono de voz.

### LLAMADA A LA ACCIÓN
Frase final para maximizar comentarios y seguidores.

Optimizá específicamente para el algoritmo y la audiencia de ${platform} en Latinoamérica.`,

  ideas: ({ filter, platform, count = 20 }) => `
Sos un estratega de contenido viral para una página de terror y crimen oscuro con audiencia latinoamericana.
Generá exactamente ${count} ideas de contenido viral para ${platform} sobre ${filter}.

Cada idea debe:
- Tener un título o gancho que genere curiosidad inmediata
- Ser fácilmente compartible
- Generar reacciones emocionales fuertes (miedo, impacto, fascinación, pavor)
- Funcionar bien en el algoritmo de ${platform}
- Resonar culturalmente con audiencia de Latinoamérica y España

Formato: Lista numerada. Una idea por línea. Sin explicaciones adicionales.
Variá entre: datos perturbadores, asesinos seriales, misterios sin resolver, lugares tenebrosos, desapariciones, paranormal, historia oscura latinoamericana.

Generá ${count} ideas ahora:`,

  images: ({ style, subject, count }) => `
Sos un director creativo especializado en imágenes de horror cinematográfico oscuro para redes sociales latinoamericanas.
Generá ${count} prompts detallados para generadores de imágenes IA en el estilo: ${style}.
${subject ? `Tema/Escena: ${subject}` : ''}

Cada prompt debe incluir: sujeto y composición, iluminación y atmósfera, paleta de colores, ángulo de cámara, estado de ánimo, estilo técnico.
Numerá cada prompt con un título descriptivo.
Los prompts deben funcionar en: Midjourney, DALL-E, Stable Diffusion.
Escribí los prompts en inglés (para mejor compatibilidad con las IAs de imagen), pero ponés el título descriptivo en español.`,

  hashtags: ({ platform, topic }) => `
Sos un experto en crecimiento en redes sociales para páginas de terror y contenido oscuro en Latinoamérica.
Generá hashtags optimizados para un post sobre: ${topic || 'terror y crimen oscuro latinoamericano'}.
Plataforma: ${platform}

### SET 1 — ALTO ALCANCE
20 hashtags de alto volumen para máximo descubrimiento. En español e inglés. Una línea, separados por espacios.

### SET 2 — NICHO ESPECÍFICO
15 hashtags de nicho que lleguen a fans comprometidos de terror y crimen. Una línea.

### SET 3 — IMPULSORES DE ENGAGEMENT
10 hashtags que fomenten interacción, guardados y compartidos. Una línea.

Incluí mezcla de español, inglés y hashtags específicos de Latinoamérica.`,

  rewrite: ({ story, goal }) => `
Sos un editor de contenido viral para una página de Facebook de terror y crimen con 230.000 seguidores latinoamericanos.
Reescribí esta historia para: ${goal}

HISTORIA ORIGINAL:
${story}

REGLAS DE REESCRITURA:
- Abrí con un gancho impactante que detenga el scroll
- Párrafos cortos y contundentes (2-3 oraciones máximo)
- Construí tensión progresiva
- Usá lenguaje sensorial y emotivo
- Terminá con un cliffhanger o pregunta que dispare comentarios
- Optimizá para engagement en Facebook latinoamericano (compartidos, comentarios, reacciones)
- Español natural y fluido, tono latinoamericano

### TÍTULO REESCRITO
### HISTORIA REESCRITA
### POR QUÉ ESTA VERSIÓN FUNCIONA MEJOR`,

  analyze: ({ post }) => `
Sos un analista de contenido viral especializado en redes sociales de terror y crimen para audiencia latinoamericana.

POST VIRAL:
${post}

### PUNTUACIÓN VIRAL
Puntuá del 1 al 10 y explicá por qué.

### POR QUÉ SE HIZO VIRAL
Los motivos psicológicos y algorítmicos exactos.

### DISPARADORES EMOCIONALES
Cada disparador emocional usado (miedo, curiosidad, indignación, impacto, etc.) y cómo funciona.

### TÁCTICAS DE ENGAGEMENT
Todas las técnicas que generan interacción (cliffhanger, pregunta, lista, etc.).

### IDEA SIMILAR
Una nueva idea viral usando las mismas mecánicas pero con contenido diferente.

### VERSIÓN MEJORADA
Reescribilo para que funcione aún mejor con ganchos y disparadores de engagement potenciados.`,

  multiply: ({ story, outputs }) => `
Sos un especialista en multiplicación de contenido para un emporio de redes sociales de terror y crimen oscuro en Latinoamérica.

HISTORIA PRINCIPAL:
${story}

Generá SOLO estos formatos, etiquetados exactamente como se muestra:
${outputs.includes('facebook_post')  ? '### FACEBOOK_POST\nPost de Facebook atrapante optimizado para compartidos y comentarios. Incluye gancho, resumen de historia y CTA con cliffhanger. Español latino natural.\n' : ''}
${outputs.includes('reel_script')    ? '### REEL_SCRIPT\nGuión para Reel de Facebook/Instagram (60 segundos). Gancho + narración + CTA. Español hablado natural.\n' : ''}
${outputs.includes('short_video')    ? '### SHORT_VIDEO\nGuión para YouTube Shorts/TikTok (30-45 segundos). Versión ultra contundente.\n' : ''}
${outputs.includes('image_prompts')  ? '### IMAGE_PROMPTS\n3 prompts cinematográficos de imagen IA que capturen la atmósfera de la historia. Prompts en inglés, títulos en español.\n' : ''}
${outputs.includes('hashtags')       ? '### HASHTAGS\nSet de hashtags optimizado para Facebook, TikTok y YouTube. Mezcla español/inglés/latinoamérica.\n' : ''}

Hacé cada formato único y optimizado para su plataforma. No repitas contenido entre formatos.`,

  dash_stories: () => `
Generá 3 ARRANQUES de historias virales para una página de Facebook de terror y crimen oscuro con audiencia latinoamericana.
Cada arranque incluye:
- Título atrapante
- Gancho de 3 oraciones
- Etiqueta de género

Formato: ítems numerados. Cada uno menos de 100 palabras. Irresistibles. Todo en español latino.`,

  dash_scripts: () => `
Generá 2 GANCHOS virales para guiones de videos cortos para Facebook Reels en el nicho de terror/crimen para audiencia latinoamericana.
Cada gancho:
- Primeros 3 segundos hablados (que haga congelar el scroll)
- Género y tono
- Premisa breve de 30 palabras para desarrollar

Formato: ítems numerados. Todo en español latino natural.`,
};

function parseMultiplierOutput(content, outputs) {
  const results = {};
  const sectionMap = {
    facebook_post: 'FACEBOOK_POST',
    reel_script:   'REEL_SCRIPT',
    short_video:   'SHORT_VIDEO',
    image_prompts: 'IMAGE_PROMPTS',
    hashtags:      'HASHTAGS',
  };
  for (const key of outputs) {
    const header = sectionMap[key];
    const regex = new RegExp(`###\\s*${header}\\s*\\n([\\s\\S]*?)(?=###|$)`, 'i');
    const match = content.match(regex);
    results[key] = match ? match[1].trim() : '';
  }
  return results;
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

  const body = req.body;
  if (!body?.type) return res.status(400).json({ error: 'Falta el parámetro type' });

  const promptFn = PROMPTS[body.type];
  if (!promptFn) return res.status(400).json({ error: `Tipo desconocido: ${body.type}` });

  let prompt;
  try { prompt = promptFn(body); }
  catch (e) { return res.status(400).json({ error: 'Parámetros inválidos: ' + e.message }); }

  try {
    const message = await client.messages.create({
      model:      'claude-opus-4-5',
      max_tokens: 2048,
      messages:   [{ role: 'user', content: prompt }],
    });

    const content = message.content[0]?.text || '';

    if (body.type === 'multiply') {
      return res.status(200).json({ content, results: parseMultiplierOutput(content, body.outputs || []) });
    }
    return res.status(200).json({ content });

  } catch (error) {
    console.error('Error API Anthropic:', error);
    return res.status(error.status || 500).json({ error: error.message || 'Error del servidor' });
  }
};
