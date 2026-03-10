/* ═══════════════════════════════════════════════════
   MOTOR VIRAL DE CONTENIDO OSCURO — API Serverless
   Motor: Google Gemini 2.0 Flash
   ═══════════════════════════════════════════════════ */

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

async function callGemini(prompt) {
  // Lee la key del entorno de Vercel
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY no está configurada en las variables de entorno');
  }

  const res = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }]
        }
      ],
      generationConfig: {
        temperature:     0.9,
        maxOutputTokens: 2048,
      },
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    const msg = data?.error?.message || `Error HTTP ${res.status}`;
    throw new Error(msg);
  }

  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Gemini no devolvió contenido');
  return text;
}

const PROMPTS = {

  story: ({ category, tone, length, angle }) => `
Eres un maestro narrador de historias oscuras para una página de Facebook con 230.000 seguidores latinoamericanos.
Escribí una historia viral de ${category} con estas especificaciones:

TONO: ${tone}
EXTENSIÓN: ${length}
${angle ? `ÁNGULO/GIRO: ${angle}` : ''}

Usá exactamente estos encabezados:

### TÍTULO VIRAL
Un título que detenga el scroll.

### GANCHO INICIAL
2-3 oraciones impactantes.

### HISTORIA
La historia completa. Párrafos cortos. Tensión progresiva. Referencias culturales latinoamericanas.

### FINAL CON CLIFFHANGER
Terminá con: "¿Querés saber qué pasó después? Comentá PARTE 2."

Todo en español latino natural.`,

  script: ({ platform, genre, duration, topic }) => `
Sos un guionista viral de videos cortos para público latinoamericano.
Creá un guión de ${duration} para ${platform} sobre ${topic || `una historia de ${genre}`}.

### GANCHO (0-3 segundos)
Frase de apertura que detiene el scroll.

### GUIÓN DE NARRACIÓN
Texto completo. Oraciones cortas. [PAUSA] donde corresponda.

### SUGERENCIAS DE ESCENAS
Viñetas con sugerencias visuales.

### NOTAS DE RITMO
Tiempos, pausas y tono de voz.

### LLAMADA A LA ACCIÓN
Frase final para maximizar comentarios.`,

  ideas: ({ filter, platform, count = 20 }) => `
Generá exactamente ${count} ideas de contenido viral para ${platform} sobre ${filter} para audiencia latinoamericana.
Lista numerada. Una idea por línea. Sin explicaciones.
Variá entre: crímenes reales, asesinos seriales, misterios sin resolver, lugares tenebrosos, paranormal, historia oscura latinoamericana.`,

  images: ({ style, subject, count }) => `
Generá ${count} prompts detallados para imágenes IA en estilo: ${style}.
${subject ? `Tema: ${subject}` : ''}
Cada prompt: sujeto, iluminación, colores, ángulo, atmósfera. Título en español, prompt en inglés. Numerados.`,

  hashtags: ({ platform, topic }) => `
Generá hashtags para: ${topic || 'terror y crimen oscuro latinoamericano'}
Plataforma: ${platform}

### SET 1 — ALTO ALCANCE
20 hashtags de alto volumen en una línea.

### SET 2 — NICHO ESPECÍFICO
15 hashtags de nicho en una línea.

### SET 3 — ENGAGEMENT
10 hashtags de interacción en una línea.`,

  rewrite: ({ story, goal }) => `
Reescribí esta historia para: ${goal}

HISTORIA:
${story}

### TÍTULO REESCRITO
### HISTORIA REESCRITA
### POR QUÉ FUNCIONA MEJOR

Español latino. Párrafos cortos. Gancho al inicio. Cliffhanger al final.`,

  analyze: ({ post }) => `
Analizá este post viral para audiencia latinoamericana:

${post}

### PUNTUACIÓN VIRAL (1-10)
### POR QUÉ SE HIZO VIRAL
### DISPARADORES EMOCIONALES
### TÁCTICAS DE ENGAGEMENT
### IDEA SIMILAR
### VERSIÓN MEJORADA`,

  multiply: ({ story, outputs }) => `
Multiplicá esta historia en diferentes formatos para redes sociales latinoamericanas:

${story}

${outputs.includes('facebook_post')  ? '### FACEBOOK_POST\nPost con gancho, resumen y CTA con cliffhanger.\n' : ''}
${outputs.includes('reel_script')    ? '### REEL_SCRIPT\nGuión 60 segundos para Reel.\n' : ''}
${outputs.includes('short_video')    ? '### SHORT_VIDEO\nGuión 30-45 segundos para TikTok/Shorts.\n' : ''}
${outputs.includes('image_prompts')  ? '### IMAGE_PROMPTS\n3 prompts de imagen IA. Títulos en español, prompts en inglés.\n' : ''}
${outputs.includes('hashtags')       ? '### HASHTAGS\nHashtags para Facebook, TikTok y YouTube.\n' : ''}`,

  dash_stories: () => `
Generá 3 arranques de historias virales de terror/crimen para audiencia latinoamericana.
Cada uno: título + gancho de 3 oraciones + género. Numerados. Menos de 100 palabras. Español latino.`,

  dash_scripts: () => `
Generá 2 ganchos virales para Reels de terror/crimen latinoamericano.
Cada uno: 3 segundos hablados + género + premisa breve. Numerados. Español latino.`,
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
    const content = await callGemini(prompt);
    if (body.type === 'multiply') {
      return res.status(200).json({ content, results: parseMultiplierOutput(content, body.outputs || []) });
    }
    return res.status(200).json({ content });
  } catch (error) {
    console.error('Error Gemini:', error.message);
    return res.status(500).json({ error: error.message });
  }
};
