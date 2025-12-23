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
        const { mongoUrl, database, collections } = JSON.parse(event.body);

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

        let exportData = {};

        // If specific collections are provided, export only those
        // Otherwise, export all collections
        if (collections && collections.length > 0) {
            for (const collectionName of collections) {
                const collection = db.collection(collectionName);
                const data = await collection.find({}).toArray();
                exportData[collectionName] = data;
            }
        } else {
            // Export all collections
            const allCollections = await db.listCollections().toArray();

            for (const col of allCollections) {
                const collection = db.collection(col.name);
                const data = await collection.find({}).toArray();
                exportData[col.name] = data;
            }
        }

        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json',
                'Content-Disposition': `attachment; filename="${database}_export.json"`
            },
            body: JSON.stringify({
                success: true,
                database: database,
                exportedAt: new Date().toISOString(),
                data: exportData
            }, null, 2)
        };

    } catch (error) {
        console.error('Error exporting data:', error);

        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                success: false,
                error: error.message || 'Failed to export data'
            })
        };
    } finally {
        if (client) {
            await client.close();
        }
    }
};
