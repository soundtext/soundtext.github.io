import { GuideMeta } from '../types';

const PUBLISHED = '2026-09-11';
const AUTHOR = 'Appz';

export const GUIDE_CATEGORIES: string[] = [
  'All',
  'WhatsApp Ringtones',
  'Character Voices',
  'Voice Generators',
];

export const GUIDES: GuideMeta[] = [
  {
    slug: 'freetts-voice-names-whatsapp',
    title: 'FreeTTS Voice Names WhatsApp',
    category: 'WhatsApp Ringtones',
    description:
      'A step-by-step look at creating name-announcement WhatsApp sounds with FreeTTS, FakeYou, and Myinstants, plus how to set the result as a ringtone.',
    listenText:
      'This guide explains how to create a text to speech message that announces the sender name for WhatsApp, using FreeTTS, FakeYou, and Myinstants, and how to set the downloaded audio as your notification sound.',
    published: PUBLISHED,
    updated: PUBLISHED,
    author: AUTHOR,
    tags: ['WhatsApp', 'Ringtone', 'FreeTTS', 'FakeYou'],
  },
  {
    slug: 'how-to-make-spongebob-voice-text-to-speech',
    title: 'How to Make SpongeBob Voice Text to Speech',
    category: 'Character Voices',
    description:
      'Turn typed text into a SpongeBob SquarePants style voice with FakeYou, then save the clip and set it as a WhatsApp ringtone.',
    listenText:
      'This guide shows how to create a SpongeBob SquarePants style voice from text using the FakeYou text to speech website, and how to download the audio and set it as a WhatsApp ringtone.',
    published: PUBLISHED,
    updated: PUBLISHED,
    author: AUTHOR,
    tags: ['SpongeBob', 'Character Voice', 'FakeYou', 'Ringtone'],
  },
  {
    slug: 'how-to-make-cristiano-ronaldo-ai-voice',
    title: 'How to Make Cristiano Ronaldo AI Voice',
    category: 'Character Voices',
    description:
      'Create a Cristiano Ronaldo style AI voice from a typed script with FakeYou and use the finished MP3 as a custom WhatsApp ringtone.',
    listenText:
      'This guide explains how to generate a Cristiano Ronaldo style AI voice from written text using FakeYou, then download the audio and set it as a WhatsApp ringtone.',
    published: PUBLISHED,
    updated: PUBLISHED,
    author: AUTHOR,
    tags: ['Cristiano Ronaldo', 'AI Voice', 'FakeYou', 'Ringtone'],
  },
  {
    slug: 'bruce-buffer-voice-generator',
    title: 'Bruce Buffer Voice Generator',
    category: 'Character Voices',
    description:
      'Use the FakeYou voice generator to produce a Bruce Buffer style announcing voice and turn the output into a WhatsApp ringtone.',
    listenText:
      'This guide covers how to use the FakeYou voice generator to create a Bruce Buffer style announcing voice from text, then save the audio and set it as a WhatsApp ringtone.',
    published: PUBLISHED,
    updated: PUBLISHED,
    author: AUTHOR,
    tags: ['Bruce Buffer', 'Voice Generator', 'FakeYou', 'Ringtone'],
  },
  {
    slug: 'best-sound-of-text-voices-for-whatsapp-ringtones',
    title: 'Best Sound of Text Voices for WhatsApp Ringtones',
    category: 'WhatsApp Ringtones',
    description:
      'Five popular text to speech voice styles for WhatsApp ringtones, from anime and baby voices to robot, movie, and name-announcement clips.',
    listenText:
      'This guide reviews five popular text to speech voice styles used for WhatsApp ringtones, including anime characters, baby voice, robot voice, movie and cartoon characters, and Google voice saying your own name.',
    published: PUBLISHED,
    updated: PUBLISHED,
    author: AUTHOR,
    tags: ['WhatsApp', 'Ringtone', 'Voice Styles'],
  },
  {
    slug: 'text-to-native-american-voice-generator',
    title: 'Text to Native American Voice Generator',
    category: 'Voice Generators',
    description:
      'A review of tools for generating a Native American Indian accent voiceover, including BlipCut, ElevenLabs, Murf AI, Play.ht, and Narakeet.',
    listenText:
      'This guide reviews tools for creating a Native American Indian accent voiceover from text, including BlipCut, ElevenLabs, Murf AI, Play dot h t, and Narakeet.',
    published: PUBLISHED,
    updated: PUBLISHED,
    author: AUTHOR,
    tags: ['Native American Voice', 'Voice Generator', 'Accent'],
  },
];

const GUIDE_CONTENT = import.meta.glob('../content/guides/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

function stripLeadingHeading(markdown: string): string {
  return markdown.replace(/^\s*#\s+.*(?:\r?\n)+/, '');
}

export function getGuideContent(slug: string): string {
  const entry = Object.entries(GUIDE_CONTENT).find(([filePath]) =>
    filePath.endsWith(`/${slug}.md`),
  );
  if (!entry) return '';
  return stripLeadingHeading(entry[1]);
}

export function getGuideBySlug(slug: string): GuideMeta | undefined {
  return GUIDES.find((guide) => guide.slug === slug);
}
