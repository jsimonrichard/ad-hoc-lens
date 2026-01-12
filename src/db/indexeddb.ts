/**
 * IndexedDB utilities for storing uploaded files
 */

import { openDB, type DBSchema, type IDBPDatabase } from "idb";

const DB_NAME = "ad-hoc-lens-files";
const DB_VERSION = 1;
const STORE_NAME = "files";

export interface StoredFile {
  id: string;
  fileName: string;
  tableName: string;
  data: ArrayBuffer;
  uploadedAt: number;
}

interface FilesDB extends DBSchema {
  files: {
    key: string;
    value: StoredFile;
  };
}

let dbPromise: Promise<IDBPDatabase<FilesDB>> | null = null;

/**
 * Get or create the IndexedDB database
 */
function getDB(): Promise<IDBPDatabase<FilesDB>> {
  if (!dbPromise) {
    dbPromise = openDB<FilesDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: "id" });
        }
      },
    });
  }
  return dbPromise;
}

/**
 * Store a file in IndexedDB
 */
export async function storeFile(
  id: string,
  fileName: string,
  tableName: string,
  fileData: ArrayBuffer
): Promise<void> {
  const db = await getDB();
  const file: StoredFile = {
    id,
    fileName,
    tableName,
    data: fileData,
    uploadedAt: Date.now(),
  };
  await db.put(STORE_NAME, file);
}

/**
 * Retrieve a file from IndexedDB
 */
export async function getFile(id: string): Promise<StoredFile | null> {
  const db = await getDB();
  return (await db.get(STORE_NAME, id)) || null;
}

/**
 * Get all stored files
 */
export async function getAllFiles(): Promise<StoredFile[]> {
  const db = await getDB();
  return await db.getAll(STORE_NAME);
}

/**
 * Delete a file from IndexedDB
 */
export async function deleteFile(id: string): Promise<void> {
  const db = await getDB();
  await db.delete(STORE_NAME, id);
}
