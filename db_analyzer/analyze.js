import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';

// Look for the service account key in the current directory
const serviceAccountPath = './tutor-app-1e394-firebase-adminsdk-fbsvc-229cb7c69a.json';

if (!fs.existsSync(serviceAccountPath)) {
  console.error(`ERROR: Service account key not found at ${serviceAccountPath}`);
  console.error('Please move your downloaded JSON key into this db_analyzer directory.');
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

// Helper to determine the type of a value
function getFieldType(value) {
  if (value === null) return 'null';
  if (Array.isArray(value)) {
    if (value.length > 0) {
      return `array of ${getFieldType(value[0])}`;
    }
    return 'array';
  }
  
  const type = typeof value;
  
  if (type === 'object') {
    // Check if it's a Firestore Timestamp (Admin SDK format)
    if (value._seconds !== undefined && value._nanoseconds !== undefined) {
      return 'timestamp';
    }
    // Check if it's a GeoPoint
    if (value._latitude !== undefined && value._longitude !== undefined) {
      return 'geopoint';
    }
    // Check if it's a DocumentReference
    if (value._path && value._path.segments) {
      return 'reference';
    }
    return 'object';
  }
  
  return type; // string, number, boolean, etc.
}

// Function to recursively extract fields from an object
function extractSchema(data, prefix = '', schemaMap) {
  for (const [key, value] of Object.entries(data)) {
    const fullPath = prefix ? `${prefix}.${key}` : key;
    const type = getFieldType(value);
    
    if (!schemaMap.has(fullPath)) {
      schemaMap.set(fullPath, new Set());
    }
    schemaMap.get(fullPath).add(type);

    if (type === 'object' && value !== null) {
      extractSchema(value, fullPath, schemaMap);
    } else if (type.startsWith('array of object') && value.length > 0) {
      // Analyze the first object in the array to map nested array fields
      extractSchema(value[0], `${fullPath}[]`, schemaMap);
    }
  }
}

async function analyzeDatabase() {
  console.log('Connecting to Firestore...');
  
  try {
    const collections = await db.listCollections();
    const dbSchema = {};
    
    console.log(`Found ${collections.length} root collections.`);
    
    for (const collection of collections) {
      console.log(`Analyzing collection: [${collection.id}]...`);
      
      const schemaMap = new Map();
      
      // Fetch up to 100 documents to sample the schema accurately
      const snapshot = await collection.limit(100).get();
      
      snapshot.forEach(doc => {
        extractSchema(doc.data(), '', schemaMap);
      });
      
      // Convert map to a clean object
      const collectionSchema = {};
      schemaMap.forEach((typesSet, fieldPath) => {
        const typesArr = Array.from(typesSet);
        collectionSchema[fieldPath] = typesArr.length > 1 ? typesArr.join(' | ') : typesArr[0];
      });
      
      dbSchema[collection.id] = {
        _documentCountSampled: snapshot.size,
        fields: collectionSchema
      };
    }
    
    // Generate Markdown Report
    let mdReport = '# Firestore Database Schema Report\n\n';
    mdReport += `Generated on: ${new Date().toISOString()}\n\n`;
    
    for (const [colName, colData] of Object.entries(dbSchema)) {
      mdReport += `## Collection: \`${colName}\`\n`;
      mdReport += `*Documents sampled: ${colData._documentCountSampled}*\n\n`;
      mdReport += '| Field Path | Data Type |\n';
      mdReport += '|---|---|\n';
      
      // Sort fields alphabetically for easier reading
      const sortedFields = Object.keys(colData.fields).sort();
      for (const field of sortedFields) {
        mdReport += `| \`${field}\` | \`${colData.fields[field]}\` |\n`;
      }
      mdReport += '\n---\n\n';
    }
    
    fs.writeFileSync('./schema_report.md', mdReport);
    console.log('✅ Analysis complete! Check schema_report.md');
    
  } catch (error) {
    console.error('Error analyzing database:', error);
  }
}

analyzeDatabase();
