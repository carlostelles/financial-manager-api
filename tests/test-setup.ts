import mongoose from "../src/database";

export async function removeAllCollections() {
    const collections = Object.keys(mongoose.connection.collections);
    for (const collectionName of collections) {
        const collection = mongoose.connection.collections[collectionName];
        await collection.deleteMany({});
    }
}

export async function dropAllCollections() {
    const collections = Object.keys(mongoose.connection.collections);
    for (const collectionName of collections) {
        try {
            await mongoose.connection.collections[collectionName].drop();
        } catch (error) {
            // Sometimes this error happens, but you can safely ignore it
            if (error.message === 'ns not found') return;
            // This error occurs when you use it. todo. You can safely ignore this error too
            if (error.message.includes('a background operation is currently running')) return;
            console.log(error.message);
        }
    }
}
