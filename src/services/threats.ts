
'use server';

import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export interface Threat {
    url: string;
    riskLevel: number;
    reason: string;
    timestamp: string;
}

/**
 * Adds a new threat to the real-time feed.
 * @param threat - The threat data to add.
 */
export async function addThreat(threat: Threat): Promise<void> {
    const db = adminDb();
    const threatRef = db.collection('threats').doc(); // Create a new document with a unique ID

    try {
        await threatRef.set(threat);
        console.log(`Threat added: ${threat.url}`);
    } catch (error) {
        console.error("Error adding threat:", error);
        // We don't throw here to avoid failing the primary user action (URL scanning)
    }
}

/**
 * Fetches the most recent threats from Firestore.
 * @param limit - The number of threats to retrieve.
 * @returns An array of recent threats.
 */
export async function getRecentThreats(limit = 20): Promise<Threat[]> {
    const db = adminDb();
    const threatsCol = db.collection('threats');
    const snapshot = await threatsCol.orderBy('timestamp', 'desc').limit(limit).get();

    if (snapshot.empty) {
        return [];
    }

    return snapshot.docs.map(doc => doc.data() as Threat);
}
