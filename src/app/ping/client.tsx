'use client'

import React, { useState, KeyboardEvent } from 'react'
import { Box, Grid, Paper } from '@mui/material'
import { Typography, StyledComponent, CustomButton } from 'goobs-repo'
import {
  ping,
  PingResult,
  PingResponse,
} from './../../main/network-monitor/utils/ping'

const PingClient: React.FC = () => {
  const [hostInput, setHostInput] = useState('')
  const [bytesInput, setBytesInput] = useState('32')
  const [countInput, setCountInput] = useState('4')
  const [ttlInput, setTtlInput] = useState('64')
  const [pingResponses, setPingResponses] = useState<PingResponse[]>([])
  const [pingStats, setPingStats] = useState<PingResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPinging, setIsPinging] = useState(false)

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target
    switch (name) {
      case 'hostInput':
        setHostInput(value)
        break
      case 'bytesInput':
        setBytesInput(value)
        break
      case 'countInput':
        setCountInput(value)
        break
      case 'ttlInput':
        setTtlInput(value)
        break
    }
  }

  const handleKeyPress = (event: KeyboardEvent<HTMLFormElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      handlePing()
    }
  }

  const handlePing = async () => {
    if (!hostInput) {
      setError('Please enter a hostname or IP address')
      return
    }

    setError(null)
    setIsPinging(true)
    setPingResponses([])
    setPingStats(null)

    const count = parseInt(countInput) || 4
    const bytes = parseInt(bytesInput) || 32
    const ttl = parseInt(ttlInput) || 64

    try {
      const result = await ping(hostInput, bytes, count, ttl)
      setPingResponses(result.responses)
      setPingStats(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred')
    } finally {
      setIsPinging(false)
    }
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: 3,
      }}
    >
      <Typography fontvariant="interh2" text="ICMP Ping Tool" />
      <form onKeyPress={handleKeyPress}>
        <Grid
          container
          spacing={2}
          sx={{ width: '100%', maxWidth: 600, marginTop: 2 }}
        >
          <Grid item xs={12}>
            <StyledComponent
              name="hostInput"
              label="Hostname or IP Address"
              componentvariant="textfield"
              outlinecolor="black"
              combinedfontcolor="black"
              value={hostInput}
              onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={6}>
            <StyledComponent
              name="bytesInput"
              label="Bytes of data"
              componentvariant="splitbutton"
              outlinecolor="black"
              combinedfontcolor="black"
              value={bytesInput}
              onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={6}>
            <StyledComponent
              name="countInput"
              label="Number of pings"
              componentvariant="textfield"
              outlinecolor="black"
              combinedfontcolor="black"
              value={countInput}
              onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={12}>
            <StyledComponent
              name="ttlInput"
              label="Time To Live (TTL)"
              componentvariant="textfield"
              outlinecolor="black"
              combinedfontcolor="black"
              value={ttlInput}
              onChange={handleInputChange}
            />
          </Grid>
        </Grid>
        <Box sx={{ marginTop: 2 }}>
          <CustomButton
            text="Ping"
            backgroundcolor="black"
            fontcolor="white"
            variant="contained"
            onClick={handlePing}
            disabled={isPinging}
          />
        </Box>
      </form>
      {error && (
        <Typography
          fontvariant="interparagraph"
          fontcolor="red"
          text={error}
          marginTop={2}
        />
      )}
      {(pingResponses.length > 0 || pingStats) && (
        <Paper
          elevation={3}
          sx={{ marginTop: 2, width: '100%', maxWidth: 600, padding: 2 }}
        >
          <Box
            sx={{
              fontFamily: 'monospace',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            <Box>
              <Typography
                fontvariant="interparagraph"
                text={`Pinging ${hostInput} with ${bytesInput} bytes of data:`}
              />
            </Box>
            {pingResponses.map((response: PingResponse, index: number) => (
              <Box key={index} sx={{ marginTop: 1 }}>
                <Typography
                  fontvariant="interparagraph"
                  text={`Reply from ${hostInput}: bytes=${response.bytes} time=${response.time} TTL=${response.ttl}`}
                />
              </Box>
            ))}
            {pingStats && (
              <>
                <Box sx={{ marginTop: 2 }}>
                  <Typography
                    fontvariant="interparagraph"
                    text={`Ping statistics for ${pingStats.host}:`}
                  />
                </Box>
                <Box>
                  <Typography
                    fontvariant="interparagraph"
                    text={`Packets: Sent = ${pingStats.packetsTransmitted}, Received = ${pingStats.packetsReceived}, Lost = ${pingStats.packetsTransmitted - pingStats.packetsReceived} (${pingStats.packetLoss.toFixed(0)}% loss),`}
                  />
                </Box>
                <Box>
                  <Typography
                    fontvariant="interparagraph"
                    text="Approximate round trip times in milli-seconds:"
                  />
                </Box>
                <Box>
                  <Typography
                    fontvariant="interparagraph"
                    text={`Minimum = ${pingStats.minRtt}ms, Maximum = ${pingStats.maxRtt}ms, Average = ${pingStats.avgRtt}ms`}
                  />
                </Box>
              </>
            )}
          </Box>
        </Paper>
      )}
    </Box>
  )
}

export default PingClient
