'use server'

import { ipcMain } from 'electron'
import { getDatabase } from './db'
import {
  startNetworkMonitor,
  stopNetworkMonitor,
  getNetworkStatus,
} from './network-monitor'
import { Config, NetworkStats } from '../types'

export async function setupIpcHandlers(): Promise<void> {
  ipcMain.handle('get-network-stats', async (event, args) => {
    const db = getDatabase()
    try {
      const stats = (await db.get(
        'latest-network-stats'
      )) as NetworkStats | null
      if (stats) {
        return stats
      } else {
        const currentStatus = await getNetworkStatus()
        return {
          timestamp: Date.now(),
          totalPackets: currentStatus.packetCount,
          bytesTransferred: 0, // This would need to be tracked separately
          activeConnections: 0, // This would need to be tracked separately
        }
      }
    } catch (error) {
      console.error('Error fetching network stats:', error)
      throw error
    }
  })

  ipcMain.handle('start-monitoring', async (event, config: Config) => {
    try {
      await startNetworkMonitor(config)
      return { success: true, message: 'Monitoring started' }
    } catch (error) {
      console.error('Error starting network monitoring:', error)
      return { success: false, message: 'Failed to start monitoring' }
    }
  })

  ipcMain.handle('stop-monitoring', async (event, args) => {
    try {
      await stopNetworkMonitor()
      return { success: true, message: 'Monitoring stopped' }
    } catch (error) {
      console.error('Error stopping network monitoring:', error)
      return { success: false, message: 'Failed to stop monitoring' }
    }
  })

  ipcMain.handle('get-config', async (event, args) => {
    const db = getDatabase()
    try {
      const config = (await db.get('config')) as Config | null
      if (config) {
        return config
      } else {
        const defaultConfig: Config = {
          captureInterface: 'eth0',
          captureFilter: 'port 80',
          logLevel: 'info',
        }
        await db.put('config', defaultConfig)
        return defaultConfig
      }
    } catch (error) {
      console.error('Error fetching config:', error)
      throw error
    }
  })

  ipcMain.handle('update-config', async (event, config: Config) => {
    const db = getDatabase()
    try {
      await db.put('config', config)
      return { success: true, message: 'Config updated' }
    } catch (error) {
      console.error('Error updating config:', error)
      return { success: false, message: 'Failed to update config' }
    }
  })
}
