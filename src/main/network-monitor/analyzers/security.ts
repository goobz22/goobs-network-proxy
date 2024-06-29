import { NetworkPacket, SecurityAnalysis } from '../../../types'

export function analyzeSecurityThreats(
  packets: NetworkPacket[]
): SecurityAnalysis {
  const analysis: SecurityAnalysis = {
    potentialThreats: [],
    suspiciousIPs: [],
    unusualPorts: [],
  }

  const knownMaliciousPorts = [4444, 31337] // Example ports, expand as needed
  const ipFrequency: { [key: string]: number } = {}

  packets.forEach(packet => {
    // Check for known malicious ports
    if (knownMaliciousPorts.includes(packet.destinationPort)) {
      analysis.potentialThreats.push(
        `Suspicious activity on port ${packet.destinationPort}`
      )
      analysis.unusualPorts.push(packet.destinationPort)
    }

    // Track IP frequency
    ipFrequency[packet.sourceIP] = (ipFrequency[packet.sourceIP] || 0) + 1

    // Simple example of detecting potential port scanning
    if (packet.flags.includes('SYN') && !packet.flags.includes('ACK')) {
      analysis.potentialThreats.push(
        `Possible port scan from ${packet.sourceIP}`
      )
    }
  })

  // Identify suspiciously active IPs
  Object.entries(ipFrequency).forEach(([ip, count]) => {
    if (count > 100) {
      // Arbitrary threshold, adjust as needed
      analysis.suspiciousIPs.push(ip)
    }
  })

  return analysis
}
