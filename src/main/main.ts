'use server'

import { app, BrowserWindow, ipcMain } from 'electron'
import * as path from 'path'
import { initDatabase, getDatabase } from './db'
import {
  startNetworkMonitor,
  stopNetworkMonitor,
  getNetworkStatus,
} from './network-monitor'
import { Config, NetworkStats } from '../types'

let mainWindow: BrowserWindow | null

const defaultConfig: Config = {
  captureInterface: 'en0',
  captureFilter: '',
  logLevel: 'info',
}

async function createWindow(): Promise<void> {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  if (app.isPackaged) {
    await mainWindow.loadFile(path.join(__dirname, '../app/index.html'))
  } else {
    await mainWindow.loadURL('http://localhost:3000')
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

async function setupIpcHandlers(): Promise<void> {
  ipcMain.handle('get-network-stats', async () => {
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
          bytesTransferred: 0,
          activeConnections: 0,
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

  ipcMain.handle('stop-monitoring', async () => {
    try {
      await stopNetworkMonitor()
      return { success: true, message: 'Monitoring stopped' }
    } catch (error) {
      console.error('Error stopping network monitoring:', error)
      return { success: false, message: 'Failed to stop monitoring' }
    }
  })

  ipcMain.handle('get-config', async () => {
    const db = getDatabase()
    try {
      const config = (await db.get('config')) as Config | null
      return config || defaultConfig
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

async function initializeApp(): Promise<void> {
  try {
    await initDatabase()
    await setupIpcHandlers()
    await createWindow()
    await startNetworkMonitor(defaultConfig)
    console.log('Application initialized successfully')
  } catch (error) {
    console.error('Failed to initialize application:', error)
    throw error
  }
}

async function shutdownApp(): Promise<void> {
  try {
    await stopNetworkMonitor()
    console.log('Network monitor stopped successfully')
  } catch (error) {
    console.error('Failed to stop network monitor:', error)
    throw error
  }
}

// Electron-specific code
if (typeof app !== 'undefined') {
  app.on('ready', initializeApp)

  app.on('window-all-closed', async () => {
    if (process.platform !== 'darwin') {
      await shutdownApp()
      app.quit()
    }
  })

  app.on('activate', async () => {
    if (mainWindow === null) {
      await createWindow()
    }
  })
}

// Error handling
process.on('uncaughtException', error => {
  console.error('Uncaught Exception:', error)
})

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason)
})

// Export functions for potential use in other server-side contexts
export { initializeApp, shutdownApp, createWindow }
