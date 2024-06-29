import { NetworkPacket, SNMPAnalysis } from '../../../types'

export function analyzeSNMPTraffic(packets: NetworkPacket[]): SNMPAnalysis {
  const snmpPackets = packets.filter(packet => packet.protocol === 'SNMP')

  const analysis: SNMPAnalysis = {
    totalSNMPPackets: snmpPackets.length,
    snmpVersionDistribution: {},
    topSourceIPs: [],
    topDestinationIPs: [],
    averageSNMPSize: 0,
    commonOIDs: [],
  }

  const sourceIPCount: { [key: string]: number } = {}
  const destIPCount: { [key: string]: number } = {}
  const oidCount: { [key: string]: number } = {}
  let totalSize = 0

  snmpPackets.forEach(packet => {
    // Assuming SNMP version is stored in the 'flags' array for simplicity
    // In a real implementation, you'd parse the SNMP version from the packet data
    const snmpVersion = packet.flags[0] || 'unknown'

    analysis.snmpVersionDistribution[snmpVersion] =
      (analysis.snmpVersionDistribution[snmpVersion] || 0) + 1

    sourceIPCount[packet.sourceIP] = (sourceIPCount[packet.sourceIP] || 0) + 1
    destIPCount[packet.destinationIP] =
      (destIPCount[packet.destinationIP] || 0) + 1

    totalSize += packet.size

    // Assuming OIDs are stored in the 'flags' array starting from index 1
    // In a real implementation, you'd parse OIDs from the packet data
    packet.flags.slice(1).forEach(oid => {
      oidCount[oid] = (oidCount[oid] || 0) + 1
    })
  })

  analysis.averageSNMPSize = totalSize / analysis.totalSNMPPackets || 0

  analysis.topSourceIPs = Object.entries(sourceIPCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10) as [string, number][]

  analysis.topDestinationIPs = Object.entries(destIPCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10) as [string, number][]

  analysis.commonOIDs = Object.entries(oidCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10) as [string, number][]

  return analysis
}
