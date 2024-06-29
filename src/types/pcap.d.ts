declare module 'pcap' {
  export function createSession(
    device: string,
    options: { filter: string }
  ): PcapSession

  export namespace decode {
    function packet(raw: {
      header: { len: number }
      payload: Buffer
    }): DecodedPacket
  }

  interface PcapSession {
    on(event: 'packet', callback: (raw: Buffer) => void): void
    close(): void
  }

  interface DecodedPacket {
    payload: {
      payload: IPPacket
    }
  }

  interface IPPacket {
    saddr: { toString: () => string }
    daddr: { toString: () => string }
    protocol: number
    payload: TCPPacket | UDPPacket | ICMPPacket
  }

  interface TCPPacket {
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

  interface UDPPacket {
    sport: number
    dport: number
  }

  interface ICMPPacket {
    type: number
  }
}
