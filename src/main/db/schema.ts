import { RootDatabaseOptions } from 'lmdb'
import {
  NetworkPacket,
  NetworkStats,
  SecurityAnalysis,
  Config,
  ICMPAnalysis,
  SNMPAnalysis,
} from '../../types'

export type DatabaseValue =
  | NetworkStats
  | Config
  | ICMPAnalysis
  | SNMPAnalysis
  | SecurityAnalysis

export interface DatabaseSchema {
  [key: string]: DatabaseValue
}

export const dbOptions: RootDatabaseOptions = {
  compression: true,
  // You can add more LMDB-specific options here as needed
}

// Re-export the imported types using 'export type'
export type {
  NetworkPacket,
  NetworkStats,
  SecurityAnalysis,
  Config,
  ICMPAnalysis,
  SNMPAnalysis,
}

// Utility function to create keys
export const createKey = (prefix: string, timestamp: number): string =>
  `${prefix}:${timestamp}`

// Utility function to parse keys
export const parseKey = (
  key: string
): { prefix: string; timestamp: number } => {
  const [prefix, timestampStr] = key.split(':')
  return {
    prefix,
    timestamp: parseInt(timestampStr, 10),
  }
}
