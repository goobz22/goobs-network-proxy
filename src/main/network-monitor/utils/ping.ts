'use server'

import { spawn } from 'child_process'

export interface PingResponse {
  bytes: number
  time: string
  ttl: number
}

export interface PingResult {
  host: string
  responses: PingResponse[]
  packetsTransmitted: number
  packetsReceived: number
  packetLoss: number
  minRtt: number
  avgRtt: number
  maxRtt: number
}

export async function ping(
  host: string,
  bytes: number = 32,
  count: number = 4,
  ttl: number = 64
): Promise<PingResult> {
  return new Promise((resolve, reject) => {
    const pingArgs = [
      '-n',
      count.toString(),
      '-l',
      bytes.toString(),
      '-i',
      ttl.toString(),
      host,
    ]
    const pingProcess = spawn('ping', pingArgs)
    let output = ''
    const responses: PingResponse[] = []

    pingProcess.stdout.on('data', (data: Buffer) => {
      const chunk = data.toString()
      output += chunk

      const lines = chunk.split('\n')
      lines.forEach((line: string) => {
        const replyMatch = line.match(
          /Reply from .+: bytes=(\d+) time([=<]*)(\d+)ms TTL=(\d+)/
        )
        if (replyMatch) {
          const response: PingResponse = {
            bytes: parseInt(replyMatch[1]),
            time: replyMatch[2] === '<' ? '<1ms' : `${replyMatch[3]}ms`,
            ttl: parseInt(replyMatch[4]),
          }
          responses.push(response)
        }
      })
    })

    pingProcess.on('close', (code: number) => {
      if (code !== 0) {
        reject(new Error(`ping process exited with code ${code}`))
        return
      }

      const lines = output.split('\n')
      let packetsTransmitted = 0
      let packetsReceived = 0
      let minRtt = Infinity
      let maxRtt = 0
      let totalRtt = 0

      const statisticsLine = lines.find((line: string) =>
        line.includes('Packets:')
      )
      if (statisticsLine) {
        const match = statisticsLine.match(
          /Sent = (\d+), Received = (\d+), Lost = (\d+)/
        )
        if (match) {
          packetsTransmitted = parseInt(match[1])
          packetsReceived = parseInt(match[2])
        }
      }

      responses.forEach((response: PingResponse) => {
        const time = parseInt(response.time)
        if (!isNaN(time)) {
          minRtt = Math.min(minRtt, time)
          maxRtt = Math.max(maxRtt, time)
          totalRtt += time
        }
      })

      const avgRtt =
        packetsReceived > 0 ? Math.round(totalRtt / packetsReceived) : 0
      const packetLoss =
        packetsTransmitted > 0
          ? ((packetsTransmitted - packetsReceived) / packetsTransmitted) * 100
          : 0

      resolve({
        host,
        responses,
        packetsTransmitted,
        packetsReceived,
        packetLoss,
        minRtt: minRtt === Infinity ? 0 : minRtt,
        avgRtt,
        maxRtt,
      })
    })
  })
}
