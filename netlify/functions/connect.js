const { MongoClient } = require('mongodb');

exports.handler = async (event, context) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  let client;
  
  try {
    const { mongoUrl } = JSON.parse(event.body);

    if (!mongoUrl) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ error: 'MongoDB URL is required' })
      };
    }

    // Create MongoDB client
    client = new MongoClient(mongoUrl, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000
    });

    // Connect to MongoDB
    await client.connect();

    // Get list of databases
    const adminDb = client.db().admin();
    const { databases } = await adminDb.listDatabases();

    // Filter out system databases
    const userDatabases = databases
      .filter(db => !['admin', 'local', 'config'].includes(db.name))
      .map(db => ({
        name: db.name,
        sizeOnDisk: db.sizeOnDisk,
        empty: db.empty
      }));

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: true,
        databases: userDatabases
      })
    };

  } catch (error) {
    console.error('Connection error:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: false,
        error: error.message || 'Failed to connect to MongoDB'
      })
    };
  } finally {
    if (client) {
      await client.close();
    }
  }
};
