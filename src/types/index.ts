export interface NetworkPacket {
  timestamp: number
  sourceIP: string
  destinationIP: string
  sourcePort: number
  destinationPort: number
  protocol: string
  size: number
  flags: string[]
}

export interface NetworkStats {
  timestamp: number
  totalPackets: number
  bytesTransferred: number
  activeConnections: number
}

export interface SecurityAnalysis {
  potentialThreats: string[]
  suspiciousIPs: string[]
  unusualPorts: number[]
}

export interface Config {
  captureInterface: string
  captureFilter: string
  logLevel: 'info' | 'warn' | 'error' | 'debug'
}

export interface ICMPAnalysis {
  totalICMPPackets: number
  icmpTypeDistribution: { [key: number]: number }
  topSourceIPs: [string, number][]
  topDestinationIPs: [string, number][]
  averageICMPSize: number
}

export interface SNMPAnalysis {
  totalSNMPPackets: number
  snmpVersionDistribution: { [key: string]: number }
  topSourceIPs: [string, number][]
  topDestinationIPs: [string, number][]
  averageSNMPSize: number
  commonOIDs: [string, number][]
}

export interface PcapSession {
  on(event: string, callback: (raw: Buffer) => void): void
  close(): void
}

export interface PcapPacket {
  header: {
    len: number
  }
  payload: Buffer
}

export interface DecodedPacket {
  payload: {
    payload: IPPacket
  }
}

export interface IPPacket {
  saddr: { toString: () => string }
  daddr: { toString: () => string }
  protocol: number
  payload: TCPPacket | UDPPacket | ICMPPacket
}

export interface TCPPacket {
  sport: number
  dport: number
  flags: {
    syn: boolean
    ack: boolean
    fin: boolean
    rst: boolean
    psh: boolean
    urg: boolean
  }
}

export interface UDPPacket {
  sport: number
  dport: number
}

export interface ICMPPacket {
  type: number
}

export interface NetworkMonitorStatus {
  isMonitoring: boolean
  packetCount: number
  lastAnalysisTime: number | null
}
