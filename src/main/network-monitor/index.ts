'use server'

import PacketCapture from './packet-capture'
import { analyzeSecurityThreats } from './analyzers/security'
import { analyzeICMPTraffic } from './analyzers/icmp'
import { analyzeSNMPTraffic } from './analyzers/snmp'
import {
  saveNetworkStats,
  saveICMPAnalysis,
  saveSNMPAnalysis,
  saveSecurityAnalysis,
} from '../db'
import {
  NetworkPacket,
  NetworkStats,
  SecurityAnalysis,
  ICMPAnalysis,
  SNMPAnalysis,
  Config,
  NetworkMonitorStatus,
} from '../../types'

let packetCapture: PacketCapture | null = null
let packets: NetworkPacket[] = []
let analysisInterval: NodeJS.Timeout | null = null
let isMonitoring: boolean = false

export async function startNetworkMonitor(config: Config): Promise<void> {
  if (isMonitoring) {
    throw new Error('Network monitoring is already running')
  }

  packetCapture = new PacketCapture(
    config.captureInterface,
    config.captureFilter
  )

  try {
    await packetCapture.start(handlePacket)
    startPeriodicAnalysis()
    isMonitoring = true
    console.log('Network monitoring started')
  } catch (error) {
    console.error('Failed to start network monitoring:', error)
    throw error
  }
}

export async function stopNetworkMonitor(): Promise<void> {
  if (!isMonitoring || !packetCapture) {
    throw new Error('Network monitoring is not running')
  }

  try {
    await packetCapture.stop()
    if (analysisInterval) {
      clearInterval(analysisInterval)
      analysisInterval = null
    }
    isMonitoring = false
    packetCapture = null
    console.log('Network monitoring stopped')
  } catch (error) {
    console.error('Failed to stop network monitoring:', error)
    throw error
  }
}

function handlePacket(packet: NetworkPacket): void {
  packets.push(packet)
}

function startPeriodicAnalysis(): void {
  analysisInterval = setInterval(() => {
    analyzeAndSave().catch(error => {
      console.error('Error during periodic analysis:', error)
    })
  }, 60000) // Analyze every minute
}

async function analyzeAndSave(): Promise<void> {
  const icmpAnalysis: ICMPAnalysis = analyzeICMPTraffic(packets)
  const snmpAnalysis: SNMPAnalysis = analyzeSNMPTraffic(packets)
  const securityAnalysis: SecurityAnalysis = analyzeSecurityThreats(packets)

  const stats: NetworkStats = {
    timestamp: new Date().getTime(),
    totalPackets: packets.length,
    bytesTransferred: packets.reduce((total, packet) => total + packet.size, 0),
    activeConnections: new Set(
      packets.map(
        p =>
          `${p.sourceIP}:${p.sourcePort}-${p.destinationIP}:${p.destinationPort}`
      )
    ).size,
  }

  try {
    await Promise.all([
      saveNetworkStats(stats),
      saveICMPAnalysis(icmpAnalysis),
      saveSNMPAnalysis(snmpAnalysis),
      saveSecurityAnalysis(securityAnalysis),
    ])

    console.log('Analysis completed and saved')
  } catch (error) {
    console.error('Error saving analysis results:', error)
  }

  // Clear the packets array after analysis
  packets = []
}

export async function getNetworkStatus(): Promise<NetworkMonitorStatus> {
  return {
    isMonitoring,
    packetCount: packets.length,
    lastAnalysisTime: analysisInterval
      ? Date.now() - (Date.now() % 60000)
      : null,
  }
}
