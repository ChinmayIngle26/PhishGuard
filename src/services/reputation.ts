
'use server';

import { adminDb } from '@/lib/firebase-admin';
import { increment } from 'firebase-admin/firestore';

export interface UserReputation {
    uid: string;
    email: string | null;
    guardPoints: number;
    feedbackCount: number;
}

const POINT_VALUES = {
    GOOD_FEEDBACK: 10,
    BAD_FEEDBACK: 1, 
};

/**
 * Creates a new user reputation document in Firestore using the Admin SDK.
 * This is typically called when a user signs up.
 * @param uid - The user's unique ID from Firebase Auth.
 * @param email - The user's email address.
 */
export async function createUserReputation(uid: string, email: string | null): Promise<void> {
    const db = adminDb(); // Get initialized Firestore instance
    const userReputationRef = db.collection('reputations').doc(uid);
    const userReputationSnap = await userReputationRef.get();

    if (!userReputationSnap.exists) {
        await userReputationRef.set({
            uid: uid,
            email: email,
            guardPoints: 0,
            feedbackCount: 0,
        });
    }
}

/**
 * Adds points to a user's reputation for providing feedback using the Admin SDK.
 * @param uid - The user's unique ID.
 * @param feedbackType - The type of feedback given ('good' or 'bad').
 */
export async function addReputationPoints(uid: string, feedbackType: 'good' | 'bad'): Promise<void> {
    const db = adminDb(); // Get initialized Firestore instance
    if (!uid) {
        throw new Error("User ID is required to add reputation points.");
    }

    const userReputationRef = db.collection('reputations').doc(uid);
    const pointsToAdd = feedbackType === 'good' ? POINT_VALUES.GOOD_FEEDBACK : POINT_VALUES.BAD_FEEDBACK;

    await userReputationRef.update({
        guardPoints: increment(pointsToAdd),
        feedbackCount: increment(1),
    });
}

/**
 * Fetches a user's reputation data from Firestore using the Admin SDK.
 * @param uid - The user's unique ID.
 * @returns The user's reputation data, or null if not found.
 */
export async function getUserReputation(uid: string): Promise<UserReputation | null> {
    const db = adminDb(); // Get initialized Firestore instance
    if (!uid) return null;

    const userReputationRef = db.collection('reputations').doc(uid);
    const userReputationSnap = await userReputationRef.get();

    if (userReputationSnap.exists) {
        return userReputationSnap.data() as UserReputation;
    } else {
        return null;
    }
}
