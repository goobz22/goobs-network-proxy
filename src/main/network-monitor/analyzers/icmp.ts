import { NetworkPacket, ICMPAnalysis } from '../../../types'

export function analyzeICMPTraffic(packets: NetworkPacket[]): ICMPAnalysis {
  const icmpPackets = packets.filter(packet => packet.protocol === 'ICMP')

  const analysis: ICMPAnalysis = {
    totalICMPPackets: icmpPackets.length,
    icmpTypeDistribution: {},
    topSourceIPs: [],
    topDestinationIPs: [],
    averageICMPSize: 0,
  }

  const sourceIPCount: { [key: string]: number } = {}
  const destIPCount: { [key: string]: number } = {}
  let totalSize = 0

  icmpPackets.forEach(packet => {
    // Assuming the ICMP type is stored in the 'flags' array for simplicity
    // In a real implementation, you'd parse the ICMP type from the packet data
    const icmpType = packet.flags[0] ? parseInt(packet.flags[0]) : 0

    analysis.icmpTypeDistribution[icmpType] =
      (analysis.icmpTypeDistribution[icmpType] || 0) + 1

    sourceIPCount[packet.sourceIP] = (sourceIPCount[packet.sourceIP] || 0) + 1
    destIPCount[packet.destinationIP] =
      (destIPCount[packet.destinationIP] || 0) + 1

    totalSize += packet.size
  })

  analysis.averageICMPSize = totalSize / analysis.totalICMPPackets || 0

  analysis.topSourceIPs = Object.entries(sourceIPCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10) as [string, number][]

  analysis.topDestinationIPs = Object.entries(destIPCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10) as [string, number][]

  return analysis
}
