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
        const { mongoUrl, database } = JSON.parse(event.body);

        if (!mongoUrl || !database) {
            return {
                statusCode: 400,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ error: 'MongoDB URL and database name are required' })
            };
        }

        // Create MongoDB client
        client = new MongoClient(mongoUrl, {
            serverSelectionTimeoutMS: 5000,
            connectTimeoutMS: 5000
        });

        // Connect to MongoDB
        await client.connect();

        // Get database
        const db = client.db(database);

        // List collections
        const collections = await db.listCollections().toArray();

        // Get collection stats
        const collectionsWithStats = await Promise.all(
            collections.map(async (col) => {
                try {
                    const stats = await db.collection(col.name).estimatedDocumentCount();
                    return {
                        name: col.name,
                        type: col.type,
                        documentCount: stats
                    };
                } catch (error) {
                    return {
                        name: col.name,
                        type: col.type,
                        documentCount: 0
                    };
                }
            })
        );

        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                success: true,
                collections: collectionsWithStats
            })
        };

    } catch (error) {
        console.error('Error listing collections:', error);

        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                success: false,
                error: error.message || 'Failed to list collections'
            })
        };
    } finally {
        if (client) {
            await client.close();
        }
    }
};
