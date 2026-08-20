import type { UploadedFileKind } from '../models/upload.model';

const DB_NAME = 'yerushalmi-upload-files';
const DB_VERSION = 1;
const STORE_NAME = 'files';

interface StoredUploadFileRecord {
  id: string;
  blob: Blob;
  name: string;
  mimeType: string;
  sizeBytes: number;
  fileType: UploadedFileKind;
}

function openUploadFileDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB is not available'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error ?? new Error('Failed to open upload file store'));
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
}

function runTransaction<T>(
  mode: IDBTransactionMode,
  run: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  return openUploadFileDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, mode);
        const store = transaction.objectStore(STORE_NAME);
        const request = run(store);

        request.onerror = () => reject(request.error ?? new Error('Upload file store operation failed'));
        request.onsuccess = () => resolve(request.result as T);

        transaction.oncomplete = () => db.close();
        transaction.onerror = () => reject(transaction.error ?? new Error('Upload file store transaction failed'));
      }),
  );
}

/** Persists a selected file locally until the inquiry is submitted. */
export async function saveUploadFile(id: string, file: File, fileType: UploadedFileKind): Promise<void> {
  const record: StoredUploadFileRecord = {
    id,
    blob: file,
    name: file.name,
    mimeType: file.type || 'application/octet-stream',
    sizeBytes: file.size,
    fileType,
  };
  await runTransaction('readwrite', (store) => store.put(record));
}

/** Loads a previously selected file after refresh. */
export async function getUploadFile(id: string): Promise<File | null> {
  const record = await runTransaction<StoredUploadFileRecord | undefined>('readonly', (store) => store.get(id));
  if (!record) return null;
  return new File([record.blob], record.name, { type: record.mimeType });
}

export async function deleteUploadFile(id: string): Promise<void> {
  await runTransaction('readwrite', (store) => store.delete(id));
}

export async function clearUploadFileStore(): Promise<void> {
  await runTransaction('readwrite', (store) => store.clear());
}

export async function hasUploadFile(id: string): Promise<boolean> {
  const record = await runTransaction<StoredUploadFileRecord | undefined>('readonly', (store) => store.get(id));
  return Boolean(record);
}
