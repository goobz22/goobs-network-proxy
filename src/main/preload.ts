import { contextBridge, ipcRenderer } from 'electron'
import { NetworkStats, Config } from '../types'

// Define the shape of our API
interface ElectronAPI {
  getNetworkStats: () => Promise<NetworkStats>
  startMonitoring: (
    config: Config
  ) => Promise<{ success: boolean; message: string }>
  stopMonitoring: () => Promise<{ success: boolean; message: string }>
  getConfig: () => Promise<Config>
  updateConfig: (
    config: Config
  ) => Promise<{ success: boolean; message: string }>
}

// Create the API object
const electronAPI: ElectronAPI = {
  getNetworkStats: () => ipcRenderer.invoke('get-network-stats'),
  startMonitoring: config => ipcRenderer.invoke('start-monitoring', config),
  stopMonitoring: () => ipcRenderer.invoke('stop-monitoring'),
  getConfig: () => ipcRenderer.invoke('get-config'),
  updateConfig: config => ipcRenderer.invoke('update-config', config),
}

// Expose the API to the renderer process
contextBridge.exposeInMainWorld('electronAPI', electronAPI)

// TypeScript type declaration for the exposed API
declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}
