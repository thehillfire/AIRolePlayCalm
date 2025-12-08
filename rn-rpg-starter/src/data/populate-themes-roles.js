/**
 * Script to populate Firebase with themes and roles for RPG class generation
 * Run this once to set up your database with thousands of options
 */

import { db } from '../services/firebase';
import { collection, addDoc, writeBatch, doc } from 'firebase/firestore';

// Massive theme database - add thousands more as needed
const THEMES = [
  // Elements & Materials
  'steel', 'void', 'coral', 'dream', 'bone', 'echo', 'prism', 'rust', 'star', 'moss',
  'crystal', 'shadow', 'flame', 'ice', 'storm', 'earth', 'wind', 'blood', 'spirit', 'light',
  'dark', 'metal', 'wood', 'stone', 'glass', 'sand', 'mud', 'clay', 'smoke', 'mist',
  
  // Nature & Organic
  'vine', 'thorn', 'petal', 'root', 'bark', 'leaf', 'seed', 'fungus', 'spore', 'nectar',
  'honey', 'silk', 'web', 'feather', 'scale', 'shell', 'pearl', 'amber', 'fossil', 'mineral',
  
  // Cosmic & Mystical
  'lunar', 'solar', 'cosmic', 'astral', 'ethereal', 'spectral', 'phantom', 'wraith', 'ghost', 'soul',
  'aurora', 'nebula', 'comet', 'meteor', 'galaxy', 'constellation', 'planet', 'satellite', 'orbit', 'gravity',
  
  // Technological
  'cyber', 'nano', 'quantum', 'digital', 'circuit', 'wire', 'gear', 'spring', 'bolt', 'screw',
  'plasma', 'laser', 'electron', 'photon', 'fusion', 'nuclear', 'atomic', 'molecular', 'cellular', 'viral',
  
  // Temporal & Dimensional
  'time', 'space', 'dimension', 'portal', 'gateway', 'bridge', 'tunnel', 'wormhole', 'rift', 'tear',
  'past', 'future', 'present', 'eternal', 'infinite', 'finite', 'bounded', 'endless', 'cyclical', 'linear',
  
  // Emotions & Concepts
  'rage', 'peace', 'chaos', 'order', 'balance', 'harmony', 'discord', 'unity', 'division', 'fusion',
  'hope', 'despair', 'joy', 'sorrow', 'fear', 'courage', 'love', 'hate', 'wisdom', 'folly',
  
  // Weather & Climate
  'thunder', 'lightning', 'rain', 'snow', 'hail', 'fog', 'cloud', 'hurricane', 'tornado', 'cyclone',
  'drought', 'flood', 'avalanche', 'earthquake', 'volcano', 'tsunami', 'blizzard', 'sandstorm', 'wildfire', 'geyser'
];

// Massive role database - add thousands more as needed
const ROLES = [
  // Combat Classes
  'hunter', 'dancer', 'engineer', 'sculptor', 'harvester', 'monk', 'butcher', 'tactician',
  'warrior', 'fighter', 'berserker', 'gladiator', 'duelist', 'champion', 'knight', 'crusader',
  'assassin', 'rogue', 'thief', 'spy', 'infiltrator', 'saboteur', 'ninja', 'shadow', 'scout', 'ranger',
  
  // Magic Users
  'mage', 'wizard', 'sorcerer', 'warlock', 'witch', 'shaman', 'druid', 'necromancer', 'summoner', 'enchanter',
  'alchemist', 'artificer', 'runemaster', 'spellsword', 'battlemage', 'archmage', 'elementalist', 'conjurer', 'diviner', 'oracle',
  
  // Support & Utility
  'healer', 'cleric', 'priest', 'paladin', 'templar', 'guardian', 'protector', 'defender', 'sentinel', 'warden',
  'bard', 'storyteller', 'musician', 'performer', 'entertainer', 'jester', 'poet', 'chronicler', 'lore-keeper', 'sage',
  
  // Crafters & Builders
  'smith', 'forger', 'crafter', 'builder', 'architect', 'mason', 'carpenter', 'weaver', 'tailor', 'seamster',
  'jeweler', 'goldsmith', 'silversmith', 'blacksmith', 'weaponsmith', 'armorsmith', 'toolmaker', 'inventor', 'tinker', 'mechanic',
  
  // Natural & Animal
  'beastmaster', 'tamer', 'trainer', 'rider', 'whisperer', 'caller', 'shepherd', 'herder', 'tracker', 'pathfinder',
  'wildling', 'savage', 'primitive', 'tribal', 'nomad', 'wanderer', 'explorer', 'adventurer', 'pioneer', 'frontiersman',
  
  // Scholarly & Academic
  'scholar', 'researcher', 'scientist', 'philosopher', 'theorist', 'academic', 'professor', 'teacher', 'mentor', 'guide',
  'librarian', 'archivist', 'curator', 'collector', 'cataloger', 'indexer', 'scribe', 'copyist', 'translator', 'interpreter',
  
  // Maritime & Aerial
  'sailor', 'navigator', 'captain', 'admiral', 'pirate', 'corsair', 'buccaneer', 'mariner', 'seaman', 'helmsman',
  'pilot', 'aviator', 'flyer', 'soarer', 'glider', 'drifter', 'floater', 'hoverer', 'swooper', 'diver'
];

/**
 * Populate the database with themes and roles
 */
export async function populateThemesAndRoles() {
  try {
    console.log('🔥 Starting to populate themes and roles database...');
    
    // Use batch writes for better performance
    const batch = writeBatch(db);
    
    // Add themes
    console.log(`📝 Adding ${THEMES.length} themes...`);
    THEMES.forEach((theme, index) => {
      const themeRef = doc(collection(db, 'rpg_themes'));
      batch.set(themeRef, {
        name: theme,
        category: getThemeCategory(theme),
        createdAt: new Date(),
        index: index
      });
    });
    
    // Add roles
    console.log(`📝 Adding ${ROLES.length} roles...`);
    ROLES.forEach((role, index) => {
      const roleRef = doc(collection(db, 'rpg_roles'));
      batch.set(roleRef, {
        name: role,
        category: getRoleCategory(role),
        createdAt: new Date(),
        index: index
      });
    });
    
    // Commit the batch
    await batch.commit();
    
    console.log(`✅ Successfully populated database with ${THEMES.length} themes and ${ROLES.length} roles!`);
    return { 
      success: true, 
      themesAdded: THEMES.length, 
      rolesAdded: ROLES.length 
    };
    
  } catch (error) {
    console.error('❌ Error populating database:', error);
    throw error;
  }
}

/**
 * Helper function to categorize themes
 */
function getThemeCategory(theme) {
  const categories = {
    elemental: ['steel', 'void', 'flame', 'ice', 'storm', 'earth', 'wind', 'water'],
    nature: ['coral', 'moss', 'vine', 'thorn', 'root', 'leaf', 'bark'],
    cosmic: ['star', 'lunar', 'solar', 'nebula', 'comet', 'galaxy'],
    mystical: ['dream', 'spirit', 'phantom', 'ethereal', 'spectral'],
    material: ['bone', 'crystal', 'metal', 'stone', 'glass', 'sand'],
    temporal: ['time', 'past', 'future', 'eternal', 'infinite']
  };
  
  for (const [category, themes] of Object.entries(categories)) {
    if (themes.includes(theme)) return category;
  }
  return 'misc';
}

/**
 * Helper function to categorize roles
 */
function getRoleCategory(role) {
  const categories = {
    combat: ['warrior', 'fighter', 'berserker', 'assassin', 'hunter', 'knight'],
    magic: ['mage', 'wizard', 'sorcerer', 'warlock', 'witch', 'shaman'],
    support: ['healer', 'cleric', 'priest', 'bard', 'guardian'],
    craft: ['smith', 'engineer', 'sculptor', 'builder', 'crafter'],
    scholar: ['scholar', 'sage', 'researcher', 'librarian']
  };
  
  for (const [category, roles] of Object.entries(categories)) {
    if (roles.includes(role)) return category;
  }
  return 'misc';
}