'use server'

import * as pcap from 'pcap'
import {
  NetworkPacket,
  PcapSession,
  PcapPacket,
  DecodedPacket,
  IPPacket,
  TCPPacket,
  UDPPacket,
  ICMPPacket,
} from '../../types'

class PacketCapture {
  private session: PcapSession | null = null
  private isCapturing = false

  constructor(
    private interfaceName: string = 'en0',
    private filter: string = ''
  ) {}

  async start(callback: (packet: NetworkPacket) => void): Promise<void> {
    if (this.isCapturing) {
      throw new Error('Packet capture is already running')
    }

    return new Promise<void>((resolve, reject) => {
      try {
        this.session = pcap.createSession(this.interfaceName, {
          filter: this.filter,
        }) as PcapSession
        this.isCapturing = true

        this.session.on('packet', (rawPacket: Buffer) => {
          const packet = this.parsePacket(rawPacket)
          callback(packet)
        })

        resolve()
      } catch (error) {
        reject(error)
      }
    })
  }

  async stop(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (this.session) {
        try {
          this.session.close()
          this.session = null
          this.isCapturing = false
          resolve()
        } catch (error) {
          reject(error)
        }
      } else {
        resolve()
      }
    })
  }

  private parsePacket(rawPacket: Buffer): NetworkPacket {
    const pcapPacket: PcapPacket = {
      header: {
        len: rawPacket.length,
      },
      payload: rawPacket,
    }

    const packet = pcap.decode.packet(pcapPacket) as DecodedPacket
    const ip = packet.payload.payload
    const transport = ip.payload

    return {
      timestamp: new Date().getTime(),
      sourceIP: ip.saddr.toString(),
      destinationIP: ip.daddr.toString(),
      sourcePort: this.getSourcePort(transport),
      destinationPort: this.getDestinationPort(transport),
      protocol: this.getProtocol(ip.protocol),
      size: pcapPacket.header.len,
      flags: this.parseFlags(transport, ip.protocol),
    }
  }

  private getSourcePort(transport: TCPPacket | UDPPacket | ICMPPacket): number {
    return 'sport' in transport ? transport.sport : 0
  }

  private getDestinationPort(
    transport: TCPPacket | UDPPacket | ICMPPacket
  ): number {
    return 'dport' in transport ? transport.dport : 0
  }

  private getProtocol(protocolNumber: number): string {
    switch (protocolNumber) {
      case 1:
        return 'ICMP'
      case 6:
        return 'TCP'
      case 17:
        return 'UDP'
      default:
        return 'UNKNOWN'
    }
  }

  private parseFlags(
    transport: TCPPacket | UDPPacket | ICMPPacket,
    protocol: number
  ): string[] {
    if (protocol === 6 && 'flags' in transport) {
      return this.parseTCPFlags(transport as TCPPacket)
    } else if (protocol === 1 && 'type' in transport) {
      return [(transport as ICMPPacket).type.toString()]
    }
    return []
  }

  private parseTCPFlags(tcp: TCPPacket): string[] {
    const flags: string[] = []
    if (tcp.flags.syn) flags.push('SYN')
    if (tcp.flags.ack) flags.push('ACK')
    if (tcp.flags.fin) flags.push('FIN')
    if (tcp.flags.rst) flags.push('RST')
    if (tcp.flags.psh) flags.push('PSH')
    if (tcp.flags.urg) flags.push('URG')
    return flags
  }
}

export default PacketCapture
