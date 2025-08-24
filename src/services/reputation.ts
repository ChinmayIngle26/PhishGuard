
'use server';

import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, updateDoc, increment, DocumentReference } from 'firebase/firestore';

const POINT_VALUES = {
    GOOD_FEEDBACK: 10,
    BAD_FEEDBACK: 1, 
};

export interface UserReputation {
    uid: string;
    email: string | null;
    guardPoints: number;
    feedbackCount: number;
}

/**
 * Creates a new user reputation document in Firestore.
 * This is typically called when a user signs up.
 * @param uid - The user's unique ID from Firebase Auth.
 * @param email - The user's email address.
 */
export async function createUserReputation(uid: string, email: string | null): Promise<void> {
    const userReputationRef = doc(db, 'reputations', uid) as DocumentReference<UserReputation>;
    const userReputationSnap = await getDoc(userReputationRef);

    if (!userReputationSnap.exists()) {
        await setDoc(userReputationRef, {
            uid: uid,
            email: email,
            guardPoints: 0,
            feedbackCount: 0,
        });
    }
}

/**
 * Adds points to a user's reputation for providing feedback.
 * @param uid - The user's unique ID.
 * @param feedbackType - The type of feedback given ('good' or 'bad').
 */
export async function addReputationPoints(uid: string, feedbackType: 'good' | 'bad'): Promise<void> {
    if (!uid) {
        throw new Error("User ID is required to add reputation points.");
    }

    const userReputationRef = doc(db, 'reputations', uid);
    const pointsToAdd = feedbackType === 'good' ? POINT_VALUES.GOOD_FEEDBACK : POINT_VALUES.BAD_FEEDBACK;

    await updateDoc(userReputationRef, {
        guardPoints: increment(pointsToAdd),
        feedbackCount: increment(1),
    });
}

/**
 * Fetches a user's reputation data from Firestore.
 * @param uid - The user's unique ID.
 * @returns The user's reputation data, or null if not found.
 */
export async function getUserReputation(uid: string): Promise<UserReputation | null> {
    if (!uid) return null;

    const userReputationRef = doc(db, 'reputations', uid) as DocumentReference<UserReputation>;
    const userReputationSnap = await getDoc(userReputationRef);

    if (userReputationSnap.exists()) {
        return userReputationSnap.data();
    } else {
        return null;
    }
}
