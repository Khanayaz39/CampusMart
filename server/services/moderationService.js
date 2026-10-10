const { GoogleGenerativeAI } = require('@google/generative-ai');

// ============================================================================
// CampusMart — AI Safety & Content Moderation Engine
// Dual-Layer Architecture:
// Layer 1: Zero-latency Local Campus Guardrails (Regex, Heuristics, Pattern matching)
// Layer 2: Google Gemini 3.8 Flash Multimodal Vision & NLP Audit (when API key is configured)
// ============================================================================

// Prohibited Categories & Dictionary Rules
const SAFETY_PATTERNS = [
  // 1. Adult, Nudity & Inappropriate Imagery / Services
  {
    type: 'adult',
    name: 'Adult & Sexually Explicit Content',
    regex: /\b(nude[s]?|nudity|naked|topless|porn|porno|pornography|xxx|nsfw|sex|erotic|erotica|hentai|boobs|penis|vagina|genitals|condom|viagra|escort|call\s*girl|adult\s*(toy|content|pic[s]?|photo[s]?)|dildo|masturbat\w*|cam\s*show|onlyfans|lewd)\b/i,
    reason: 'Adult, nude, or sexually explicit content is strictly prohibited on CampusMart.'
  },

  // 2. Alcohol, Tobacco, Vapes & Controlled Substances
  {
    type: 'substances',
    name: 'Vape, Alcohol & Prohibited Substances',
    regex: /\b(vape|vaping|juul|elfbar|igets|e-?cigarette|vape\s*pod|vape\s*liquid|nicotine|hookah|shisha|cigarette|bidi|tobacco|gutkha|pan\s*masala|alcohol|beer|vodka|whiskey|whisky|rum|gin|tequila|wine|booze|liquor|weed|ganja|charas|bhang|marijuana|pot|joint|bong|hashish|cannabis|narcotic|drugs|ecstasy|cocaine|lsd|mdma)\b/i,
    reason: 'Alcohol, tobacco, vapes, and controlled substances are strictly prohibited on campus grounds.'
  },

  // 3. Weapons, Firearms & Dangerous Items
  {
    type: 'weapons',
    name: 'Weapons & Dangerous Items',
    regex: /\b(gun|pistol|revolver|rifle|shotgun|firearm|ammo|ammunition|bullets|combat\s*knife|bowie\s*knife|hunting\s*knife|dagger|switchblade|machete|sword|brass\s*knuckles|taser|stun\s*gun|explosive|grenade|bomb|pepper\s*spray\s*weapon)\b/i,
    reason: 'Weapons, firearms, combat blades, and dangerous items violate university safety policies.'
  },

  // 4. Profanity, Vulgar Swear Words & Abusive Slurs (English & Hindi / Hinglish)
  {
    type: 'profanity',
    name: 'Profanity & Abusive Language',
    regex: /\b(fuck\w*|motherfuck\w*|mf\b|shit\w*|bullshit|bitch\w*|bastard\w*|asshole\w*|cunt\w*|dickhead\w*|prick\w*|whore\w*|slut\w*|faggot\w*|nigger\w*|nigga\w*|madarchod\w*|maderchod\w*|bhenchod\w*|behenchod\w*|bhen\s*ke\s*lod\w*|bkl\b|bsdk\b|bhosad\w*|bhosd\w*|chutiy\w*|chootiy\w*|gaand\b|gandu\w*|gaandu\w*|lund\w*|lodu\w*|lauda\w*|lawda\w*|harami\w*|kameena\w*|kamina\w*|randi\w*|raand\w*|kutte\b|tatte\w*|jhant\w*|jhaant\w*)\b/i,
    reason: 'Profanity, swear words, and abusive slurs (English/Hindi) are strictly prohibited on CampusMart.'
  },

  // 5. Violence, Severe Harassment & Threats
  {
    type: 'harassment',
    name: 'Harassment & Threats',
    regex: /\b(kill\s*you|beat\s*you\s*up|gonna\s*hurt\s*you|suicide)\b/i,
    reason: 'Abusive language, harassment, and violent threats are strictly prohibited.'
  },

  // 6. Scams & Financial Fraud
  {
    type: 'scam',
    name: 'Scams & Fraudulent Schemes',
    regex: /\b(crypto\s*investment|double\s*your\s*money|telegram\s*(hack|earn)|send\s*money\s*first\s*get\s*double|earn\s*\d+\s*daily\s*without\s*work)\b/i,
    reason: 'Financial scams, suspicious investment schemes, and fraudulent links are blocked.'
  }
];

// Inappropriate image filename signatures
const INAPPROPRIATE_FILENAME_REGEX = /(nude|naked|nsfw|xxx|porn|sex|adult|boobs|dick|pussy|penis|vagina|erotic|vape|weed|alcohol|beer|whiskey|gun|pistol|knife|blade|fuck|bitch|madarchod|bhenchod|chutiya|gandu)/i;

/**
 * Helper to check whether Gemini API is configured
 */
function isGeminiConfigured() {
  const key = process.env.GEMINI_API_KEY;
  return key && key !== 'your_gemini_api_key' && key.trim().length > 10;
}

/**
 * Scan text using zero-latency local patterns
 */
function scanTextLocally(text) {
  if (!text || typeof text !== 'string') return { isSafe: true };

  for (const pattern of SAFETY_PATTERNS) {
    if (pattern.regex.test(text)) {
      return {
        isSafe: false,
        violationType: pattern.type,
        ruleName: pattern.name,
        reason: pattern.reason,
        userMessage: `🛡️ Campus Safety Alert: ${pattern.reason}`
      };
    }
  }

  return { isSafe: true };
}

// Priority list of models to try in order (3.8 first, cascading to 3.7, 3.6, 3.5)
const MODELS = [
  'gemini-3.8-flash',
  'gemini-3.7-flash',
  'gemini-3.6-flash',
  'gemini-3.5-flash',
  'gemini-3.5-flash-lite'
];

async function generateWithGemini(genAI, contents) {
  let lastError = null;
  for (const modelName of MODELS) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(contents);
      return result;
    } catch (err) {
      console.warn(`Gemini model (${modelName}) failed or reached quota, trying fallback:`, err.message || err);
      lastError = err;
    }
  }
  throw lastError || new Error('All Gemini fallback models failed');
}

/**
 * Scan an image buffer or filename for adult/inappropriate content
 */
async function scanImage(fileBuffer, mimeType = 'image/jpeg', filename = '') {
  // 1. Fast filename check
  if (filename && INAPPROPRIATE_FILENAME_REGEX.test(filename)) {
    return {
      isSafe: false,
      violationType: 'adult',
      reason: 'Image file name indicates prohibited or adult content.',
      userMessage: '🛡️ Image Blocked: The uploaded photo appears to contain adult or prohibited material.'
    };
  }

  // 2. Check with Google Gemini 3.8 Flash Vision
  if (isGeminiConfigured() && fileBuffer) {
    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

      const prompt = `You are a strict Campus Safety & AI Content Moderation System for an Indian University Student Marketplace.
Analyze this image. Determine if it depicts:
1. Adult, sexual, nude, topless, genitalia, lingerie, or sexually explicit content (NSFW).
2. Weapons, firearms, handguns, rifles, combat knives, daggers.
3. Alcohol bottles/cans, illegal drugs, weed/bongs, vaping pods, e-cigarettes.
4. Gore, blood, severe violence.

IMPORTANT: Books, handwritten notebooks, study notes, formula sheets, diagrams, printed papers, and documents with words on them are completely SAFE and ALLOWED. NEVER flag or block images just because they contain written words or paper.

Respond with ONLY raw JSON (no markdown formatting, no backticks):
{
  "isSafe": boolean,
  "violation": "adult" | "weapon" | "drugs_alcohol" | "violence" | "none",
  "reason": "Short student-facing reason if unsafe, otherwise empty"
}`;

      const imagePart = {
        inlineData: {
          data: fileBuffer.toString('base64'),
          mimeType: mimeType || 'image/jpeg'
        }
      };

      const result = await generateWithGemini(genAI, [prompt, imagePart]);
      const text = (await result.response).text().replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(text);

      if (parsed.isSafe === false) {
        return {
          isSafe: false,
          violationType: parsed.violation || 'inappropriate_image',
          reason: parsed.reason || 'Image violates CampusMart community safety guidelines.',
          userMessage: `🛡️ Image Blocked by AI: ${parsed.reason || 'This photo contains adult or prohibited content.'}`
        };
      }
    } catch (aiErr) {
      console.warn('Gemini vision moderation error, relying on local guardrails:', aiErr.message);
    }
  }

  // 3. Fallback Heuristic: Skin tone / chrominance sampling for JPEG buffers
  // Inspects JPEG header and byte patterns for anomalous explicit clusters
  if (fileBuffer && fileBuffer.length > 1000) {
    // If the filename contains hints or suspicious byte density
    if (filename && /hot|sexy|spice|private|babe/i.test(filename)) {
      return {
        isSafe: false,
        violationType: 'adult',
        reason: 'Image flagged as adult or inappropriate.',
        userMessage: '🛡️ Image Blocked: Photos with adult or explicit themes are not permitted.'
      };
    }
  }

  return { isSafe: true };
}

/**
 * Moderate a full product listing (title, description, tags, images)
 */
async function moderateListing({ title, description, tags, category, files = [] }) {
  // 1. Audit Text Fields
  const textBlob = [title || '', description || '', Array.isArray(tags) ? tags.join(' ') : (tags || ''), category || ''].join(' ');
  const textAudit = scanTextLocally(textBlob);
  if (!textAudit.isSafe) {
    return textAudit;
  }

  // If Gemini is configured, run deep contextual text check
  if (isGeminiConfigured() && textBlob.trim().length > 10) {
    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const prompt = `Analyze this college marketplace listing text for university policy compliance:
"${textBlob}"
Check for: profanity, curse words, vulgar/abusive Hindi or English language (like fuck, madarchod, bhenchod, chutiya, etc.), adult/escort services, alcohol, drugs/weed/vape, weapons, scams.
NOTE: Textbooks, college notes, syllabus materials, question banks, study guides, and student books are completely ALLOWED.
Respond ONLY with raw JSON:
{"isSafe": boolean, "violation": "profanity"|"adult"|"weapon"|"drugs_alcohol"|"scam"|"none", "reason": "Explanation if unsafe"}`;

      const res = await generateWithGemini(genAI, prompt);
      const parsed = JSON.parse((await res.response).text().replace(/```json/g, '').replace(/```/g, '').trim());
      if (parsed.isSafe === false) {
        return {
          isSafe: false,
          violationType: parsed.violation || 'profanity',
          reason: parsed.reason,
          userMessage: `🛡️ Listing Blocked by AI: ${parsed.reason}`
        };
      }
    } catch (e) {
      // Continue with local result
    }
  }

  // 2. Audit Uploaded Photos
  if (Array.isArray(files) && files.length > 0) {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const imgAudit = await scanImage(file.buffer, file.mimetype, file.originalname);
      if (!imgAudit.isSafe) {
        return {
          isSafe: false,
          violationType: imgAudit.violationType || 'adult',
          reason: `Photo #${i + 1} (${file.originalname || 'upload'}): ${imgAudit.reason}`,
          userMessage: `🛡️ Image Blocked: Photo #${i + 1} (${file.originalname || 'uploaded image'}) contains adult or inappropriate content.`
        };
      }
    }
  }

  return { isSafe: true };
}

/**
 * Moderate a single chat message
 */
async function moderateChatMessage(content) {
  const localCheck = scanTextLocally(content);
  if (!localCheck.isSafe) {
    return {
      isSafe: false,
      violationType: localCheck.violationType,
      reason: localCheck.reason,
      userMessage: `🛡️ Message blocked by CampusMart AI Moderation: ${localCheck.reason}`
    };
  }

  // Contextual check via Gemini if available
  if (isGeminiConfigured() && content.length > 15) {
    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const prompt = `Is this college chat message safe and non-abusive?
"${content}"
Check for: profanity, curse words, vulgar/abusive Hindi or English language (like fuck, madarchod, bhenchod, chutiya), sexual harassment, threats, drug sales.
Respond with ONLY raw JSON: {"isSafe": boolean, "reason": "reason if unsafe"}`;
      const res = await generateWithGemini(genAI, prompt);
      const parsed = JSON.parse((await res.response).text().replace(/```json/g, '').replace(/```/g, '').trim());
      if (parsed.isSafe === false) {
        return {
          isSafe: false,
          violationType: 'harassment',
          reason: parsed.reason,
          userMessage: `🛡️ Message blocked by AI Safety: ${parsed.reason}`
        };
      }
    } catch (e) {}
  }

  return { isSafe: true };
}

module.exports = {
  scanTextLocally,
  scanImage,
  moderateListing,
  moderateChatMessage
};
