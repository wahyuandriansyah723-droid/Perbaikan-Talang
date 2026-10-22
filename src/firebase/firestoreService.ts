import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  writeBatch,
  getDocs
} from 'firebase/firestore';
import { db, auth } from './config';
import { GutterReport, SystemSettings, DEFAULT_SETTINGS } from '../types';
import { INITIAL_REPORTS } from '../data/mockData';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Clean undefined fields before writing to Firestore
function sanitizePayload<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj, (_, val) => (val === undefined ? null : val)));
}

/**
 * Real-time subscription to reports collection in Firestore
 */
export function subscribeToReports(
  onData: (reports: GutterReport[]) => void,
  onError?: (error: Error) => void
) {
  const reportsCol = collection(db, 'reports');

  return onSnapshot(
    reportsCol,
    async (snapshot) => {
      try {
        if (snapshot.empty) {
          // First time database bootstrap: seed INITIAL_REPORTS
          console.log('Firestore reports collection is empty. Seeding INITIAL_REPORTS...');
          await seedInitialReports();
          return;
        }

        const loadedReports: GutterReport[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as GutterReport;
          loadedReports.push({
            ...data,
            id: data.id || docSnap.id,
          });
        });

        // Ensure stable ordering (by id or code or createdAt)
        onData(loadedReports);
      } catch (err) {
        console.error('Error processing reports snapshot:', err);
        if (onError) onError(err as Error);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, 'reports');
      if (onError) onError(error);
    }
  );
}

/**
 * Real-time subscription to system settings in Firestore
 */
export function subscribeToSettings(
  onData: (settings: SystemSettings) => void,
  onError?: (error: Error) => void
) {
  const settingsDocRef = doc(db, 'settings', 'system');

  return onSnapshot(
    settingsDocRef,
    async (snapshot) => {
      try {
        if (!snapshot.exists()) {
          console.log('Firestore settings document does not exist. Seeding DEFAULT_SETTINGS...');
          await saveSettingsToFirestore(DEFAULT_SETTINGS);
          return;
        }

        const data = snapshot.data() as SystemSettings;
        onData({ ...DEFAULT_SETTINGS, ...data });
      } catch (err) {
        console.error('Error processing settings snapshot:', err);
        if (onError) onError(err as Error);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, 'settings/system');
      if (onError) onError(error);
    }
  );
}

/**
 * Seed initial reports into Firestore
 */
export async function seedInitialReports(): Promise<void> {
  const path = 'reports';
  try {
    const batch = writeBatch(db);
    for (const report of INITIAL_REPORTS) {
      const docRef = doc(db, 'reports', report.id);
      batch.set(docRef, sanitizePayload(report));
    }
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Save / Update a single report in Firestore
 */
export async function saveReportToFirestore(report: GutterReport): Promise<void> {
  const path = `reports/${report.id}`;
  try {
    const docRef = doc(db, 'reports', report.id);
    await setDoc(docRef, sanitizePayload(report), { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Delete a report from Firestore
 */
export async function deleteReportFromFirestore(reportId: string): Promise<void> {
  const path = `reports/${reportId}`;
  try {
    const docRef = doc(db, 'reports', reportId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Delete multiple reports in batch from Firestore
 */
export async function deleteReportsBatch(reportIds: string[]): Promise<void> {
  if (!reportIds || reportIds.length === 0) return;
  const path = 'reports';
  try {
    // Firestore batch limit is 500 operations; we chunk by 400 safely
    const chunkSize = 400;
    for (let i = 0; i < reportIds.length; i += chunkSize) {
      const chunk = reportIds.slice(i, i + chunkSize);
      const batch = writeBatch(db);
      for (const id of chunk) {
        const docRef = doc(db, 'reports', id);
        batch.delete(docRef);
      }
      await batch.commit();
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Save / Update system settings in Firestore
 */
export async function saveSettingsToFirestore(settings: SystemSettings): Promise<void> {
  const path = 'settings/system';
  try {
    const docRef = doc(db, 'settings', 'system');
    await setDoc(docRef, sanitizePayload(settings), { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Restore reports from backup file to Firestore
 */
export async function restoreReportsToFirestore(reports: GutterReport[]): Promise<void> {
  const path = 'reports';
  try {
    // Delete existing reports first
    const existingSnap = await getDocs(collection(db, 'reports'));
    const batch = writeBatch(db);
    existingSnap.forEach(d => {
      batch.delete(d.ref);
    });
    // Add restored reports
    for (const rep of reports) {
      const docRef = doc(db, 'reports', rep.id);
      batch.set(docRef, sanitizePayload(rep));
    }
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Reset all reports in Firestore to default initial reports
 */
export async function resetAllReportsInFirestore(): Promise<void> {
  const path = 'reports';
  try {
    const existingSnap = await getDocs(collection(db, 'reports'));
    const batch = writeBatch(db);
    existingSnap.forEach(d => {
      batch.delete(d.ref);
    });
    for (const report of INITIAL_REPORTS) {
      const docRef = doc(db, 'reports', report.id);
      batch.set(docRef, sanitizePayload(report));
    }
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}
