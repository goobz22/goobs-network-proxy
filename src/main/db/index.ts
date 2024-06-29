import { open, RootDatabase } from 'lmdb'
import path from 'path'
import { app } from 'electron'
import {
  DatabaseSchema,
  DatabaseValue,
  dbOptions,
  NetworkStats,
  Config,
  ICMPAnalysis,
  SNMPAnalysis,
  SecurityAnalysis,
  createKey,
} from './schema'

let db: RootDatabase<DatabaseValue, string>

export function initDatabase(): void {
  const dbPath = path.join(app.getPath('userData'), 'networkMonitor.lmdb')
  db = open<DatabaseValue, string>({
    path: dbPath,
    ...dbOptions,
  })
}

export function getDatabase(): RootDatabase<DatabaseValue, string> {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.')
  }
  return db
}

export async function saveNetworkStats(stats: NetworkStats): Promise<void> {
  const key = createKey('networkStats', stats.timestamp)
  await db.put(key, stats)
}

export async function getLatestNetworkStats(): Promise<NetworkStats | null> {
  let latestStats: NetworkStats | null = null
  for await (const { key, value } of db.getRange({
    start: 'networkStats:',
    end: 'networkStats;',
    reverse: true,
    limit: 1,
  })) {
    latestStats = value as NetworkStats
    break
  }
  return latestStats
}

export async function saveICMPAnalysis(analysis: ICMPAnalysis): Promise<void> {
  const key = createKey('icmpAnalysis', Date.now())
  await db.put(key, analysis)
}

export async function getLatestICMPAnalysis(): Promise<ICMPAnalysis | null> {
  let latestAnalysis: ICMPAnalysis | null = null
  for await (const { key, value } of db.getRange({
    start: 'icmpAnalysis:',
    end: 'icmpAnalysis;',
    reverse: true,
    limit: 1,
  })) {
    latestAnalysis = value as ICMPAnalysis
    break
  }
  return latestAnalysis
}

export async function saveSNMPAnalysis(analysis: SNMPAnalysis): Promise<void> {
  const key = createKey('snmpAnalysis', Date.now())
  await db.put(key, analysis)
}

export async function getLatestSNMPAnalysis(): Promise<SNMPAnalysis | null> {
  let latestAnalysis: SNMPAnalysis | null = null
  for await (const { key, value } of db.getRange({
    start: 'snmpAnalysis:',
    end: 'snmpAnalysis;',
    reverse: true,
    limit: 1,
  })) {
    latestAnalysis = value as SNMPAnalysis
    break
  }
  return latestAnalysis
}

export async function saveSecurityAnalysis(
  analysis: SecurityAnalysis
): Promise<void> {
  const key = createKey('securityAnalysis', Date.now())
  await db.put(key, analysis)
}

export async function getLatestSecurityAnalysis(): Promise<SecurityAnalysis | null> {
  let latestAnalysis: SecurityAnalysis | null = null
  for await (const { key, value } of db.getRange({
    start: 'securityAnalysis:',
    end: 'securityAnalysis;',
    reverse: true,
    limit: 1,
  })) {
    latestAnalysis = value as SecurityAnalysis
    break
  }
  return latestAnalysis
}

export async function saveConfig(config: Config): Promise<void> {
  await db.put('config', config)
}

export async function getConfig(): Promise<Config | null> {
  const config = await db.get('config')
  return config as Config | null
}

export async function closeDatabase(): Promise<void> {
  if (db) {
    await db.close()
  }
}
