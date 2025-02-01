const BANNED_WORDS = [
  'hack', 'cheat', 'crack', 'leak', 'steal', 'fraud',
  'nsfw', 'xxx', 'porn', 'sex', 'nude', 'naked', 'adult',
  'discord.gg', 'telegram', 'whatsapp', '70Games', 'cracked.io'
];

// Helper to validate image URLs
const isValidImageUrl = (url) => {
  try {
    const urlObj = new URL(url);
    return /\.(jpg|jpeg|png|webp|gif)$/i.test(urlObj.pathname);
  } catch {
    return false;
  }
};

export function moderateContent(text) {
  if (!text) return { isValid: false, reason: 'Content cannot be empty' };
  
  const lowerText = text.toLowerCase();
  
  // Check for banned words
  const bannedWord = BANNED_WORDS.find(word => lowerText.includes(word));
  if (bannedWord) {
    return {
      isValid: false,
      reason: 'Content contains prohibited words or links'
    };
  }

  // Check for excessive caps (now only if text is longer than 20 characters)
  if (text.length > 50) {
    const capsPercentage = (text.match(/[A-Z]/g) || []).length / text.length;
    if (capsPercentage > 0.8) {
      return {
        isValid: false,
        reason: 'Too many capital letters'
      };
    }
  }

  // Check for character repetition (now allows up to 5 repeated characters)
  if (/(.)\1{20,}/.test(text)) {
    return {
      isValid: false,
      reason: 'Too many repeated characters'
    };
  }

  // Minimum length check
  if (text.trim().length < 2) {
    return {
      isValid: false,
      reason: 'Content is too short'
    };
  }

  // Maximum length check
  if (text.length > 7000) {
    return {
      isValid: false,
      reason: 'Content is too long (maximum 5000 characters)'
    };
  }

  // Check for excessive punctuation (now allows up to 4 repeated punctuation marks)
  if (/[!?]{10,}/.test(text)) {
    return {
      isValid: false,
      reason: 'Excessive punctuation detected'
    };
  }

  // Check for emoji spam (now allows up to 15 emojis)
  const emojiCount = (text.match(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g) || []).length;
  if (emojiCount > 20) {
    return {
      isValid: false,
      reason: 'Too many emojis'
    };
  }

  return { isValid: true };
}

// Process content to convert URLs to embeds
export function processContent(text) {
  if (!text) return '';
  
  // Convert image URLs to image elements
  const imageRegex = /(https?:\/\/[^\s]+\.(?:jpg|jpeg|png|gif|webp))/gi;
  const processedText = text.replace(imageRegex, (url) => {
    if (isValidImageUrl(url)) {
      return `<div class="my-4"><img src="${url}" alt="User posted image" class="max-w-full h-auto rounded-lg max-h-[500px] object-contain" onerror="this.style.display='none'" /></div>`;
    }
    return url;
  });

  // Convert regular URLs to links
  const urlRegex = /(https?:\/\/[^\s]+)(?![^<]*>|[^<>]*<\/)/gi;
  return processedText.replace(urlRegex, (url) => {
    return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-blue-400 hover:underline">${url}</a>`;
  });
}