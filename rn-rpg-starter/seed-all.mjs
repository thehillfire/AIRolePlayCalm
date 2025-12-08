#!/usr/bin/env node

/**
 * Firebase Firestore Bulk Seeder
 * Imports themes.json, roles.json, and metadata.json into Firestore
 */

import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';

// Configuration
const BATCH_SIZE = 450; // Safe batch size for Firestore
const SERVICE_ACCOUNT_PATH = './serviceAccountKey.json';

// File paths
const FILES = {
  themes: './themes.json',
  roles: './roles.json',
  metadata: './metadata.json'
};

/**
 * Initialize Firebase Admin SDK
 */
function initializeFirebase() {
  try {
    console.log('🔧 Initializing Firebase Admin SDK...');
    
    if (!fs.existsSync(SERVICE_ACCOUNT_PATH)) {
      throw new Error(`Service account key not found at: ${SERVICE_ACCOUNT_PATH}`);
    }
    
    const serviceAccount = JSON.parse(fs.readFileSync(SERVICE_ACCOUNT_PATH, 'utf8'));
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: serviceAccount.project_id
    });
    
    console.log(`✅ Connected to Firebase project: ${serviceAccount.project_id}`);
    return admin.firestore();
  } catch (error) {
    console.error('❌ Failed to initialize Firebase:', error.message);
    process.exit(1);
  }
}

/**
 * Read and validate JSON file
 */
function readJsonFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(content);
    
    console.log(`📄 Loaded ${filePath}: ${Object.keys(data).length} records`);
    return data;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(`Invalid JSON in ${filePath}: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Upload documents in batches
 */
async function uploadInBatches(db, collectionName, data) {
  const entries = Object.entries(data);
  const totalDocs = entries.length;
  
  if (totalDocs === 0) {
    console.log(`⚠️ No documents to upload for ${collectionName}`);
    return;
  }
  
  console.log(`🚀 Starting upload to /${collectionName}: ${totalDocs} documents`);
  
  let uploadedCount = 0;
  
  for (let i = 0; i < entries.length; i += BATCH_SIZE) {
    const batch = db.batch();
    const batchEntries = entries.slice(i, i + BATCH_SIZE);
    
    // Add documents to batch
    for (const [docId, docData] of batchEntries) {
      const docRef = db.collection(collectionName).doc(docId);
      batch.set(docRef, docData);
    }
    
    // Execute batch
    try {
      await batch.commit();
      uploadedCount += batchEntries.length;
      
      const rangeStart = i + 1;
      const rangeEnd = Math.min(i + BATCH_SIZE, totalDocs);
      console.log(`✅ Uploaded ${rangeStart}–${rangeEnd} to /${collectionName} (${uploadedCount}/${totalDocs})`);
      
    } catch (error) {
      console.error(`❌ Batch upload failed for ${collectionName}:`, error.message);
      throw error;
    }
  }
  
  console.log(`🎯 Completed /${collectionName}: ${uploadedCount} documents uploaded`);
}

/**
 * Upload metadata config as single document
 */
async function uploadMetadataConfig(db, metadataData) {
  try {
    if (!metadataData.config) {
      throw new Error('metadata.json must contain a "config" object');
    }
    
    console.log('🚀 Uploading metadata config...');
    
    const configRef = db.collection('metadata').doc('config');
    await configRef.set(metadataData.config);
    
    console.log('✅ Uploaded /metadata/config');
  } catch (error) {
    console.error('❌ Failed to upload metadata config:', error.message);
    throw error;
  }
}

/**
 * Main seeding function
 */
async function seedAll() {
  console.log('🌱 Starting Firebase Firestore seeding...\n');
  
  try {
    // Initialize Firebase
    const db = initializeFirebase();
    
    // Read all JSON files
    console.log('\n📚 Reading JSON files...');
    const themesData = readJsonFile(FILES.themes);
    const rolesData = readJsonFile(FILES.roles);
    const metadataData = readJsonFile(FILES.metadata);
    
    console.log('\n🔥 Starting Firestore uploads...\n');
    
    // Upload themes collection
    await uploadInBatches(db, 'themes', themesData);
    console.log('');
    
    // Upload roles collection
    await uploadInBatches(db, 'roles', rolesData);
    console.log('');
    
    // Upload metadata config
    await uploadMetadataConfig(db, metadataData);
    
    console.log('\n🎉 Seeding complete! All data has been uploaded to Firestore.');
    console.log('\n📊 Summary:');
    console.log(`   • Themes: ${Object.keys(themesData).length} documents`);
    console.log(`   • Roles: ${Object.keys(rolesData).length} documents`);
    console.log(`   • Metadata: 1 config document`);
    
  } catch (error) {
    console.error('\n💥 Seeding failed:', error.message);
    process.exit(1);
  }
}

/**
 * Run the seeder
 */
if (import.meta.url === `file://${process.argv[1]}`) {
  seedAll().finally(() => {
    console.log('\n👋 Seeding process finished.');
    process.exit(0);
  });
}

export default seedAll;