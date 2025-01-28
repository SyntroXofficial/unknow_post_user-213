const BANNED_WORDS = [
  'gay', 'scam', 'hack', 'cheat', 'crack', 'leak', 'steal', 'fraud',
  'nsfw', 'xxx', 'porn', 'sex', 'nude', 'naked', 'adult',
  'fuck', 'shit', 'ass', 'bitch', 'dick', 'pussy', 'cunt',
  'nigger', 'nigga', 'faggot', 'retard', 'kill', 'die', 'suicide',
  'discord.gg', 'telegram', 'whatsapp' , '70Games' , 'cracked.io'
];

export function moderateContent(text) {
  const lowerText = text.toLowerCase();
  
  const containsBannedWords = BANNED_WORDS.some(word => lowerText.includes(word));
  if (containsBannedWords) {
    return {
      isValid: false,
      reason: 'Content contains prohibited words or links'
    };
  }

  const capsPercentage = (text.match(/[A-Z]/g) || []).length / text.length;
  if (capsPercentage > 0.7) {
    return {
      isValid: false,
      reason: 'Too many capital letters'
    };
  }

  if (/(.)\1{4,}/.test(text)) {
    return {
      isValid: false,
      reason: 'Repeated characters detected'
    };
  }

  if (text.trim().length < 2) {
    return {
      isValid: false,
      reason: 'Content is too short'
    };
  }

  if (text.length > 2000) {
    return {
      isValid: false,
      reason: 'Content is too long (maximum 2000 characters)'
    };
  }

  if (/[!?]{3,}/.test(text)) {
    return {
      isValid: false,
      reason: 'Excessive punctuation detected'
    };
  }

  const emojiCount = (text.match(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g) || []).length;
  if (emojiCount > 10) {
    return {
      isValid: false,
      reason: 'Too many emojis'
    };
  }

  return { isValid: true };
}