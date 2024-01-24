import React, { useCallback, useEffect, useState } from 'react'
import { useSocket } from '../context/SocketProvider'
import ReactPlayer from 'react-player'
import peer from '../service/peer'

const Room = (props) => {
  const socket = useSocket()
  const [remoteSocketId, setRemoteSocketId] = useState(null)
  const [myStream, setMyStream] = useState(null)
  const [remoteStream, setRemoteStream] = useState(null)

  const handleUserJoined = useCallback(({ email, id }) => {
    setRemoteSocketId(id)
    console.log('user joined room', email, id)
  }, [])

  const handleCallUser = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true})
    const offer = await peer.getOffer()
    socket.emit('user:call', { to: remoteSocketId, offer })
    setMyStream(stream)
  }, [remoteSocketId, socket])

  const handleIncommingCall = useCallback(async ({ from, offer }) => {
    setRemoteSocketId(from)
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true})
    setMyStream(stream)

    console.log('incomming call from', from, offer)
    const ans = await peer.getAnswer(offer)
    socket.emit('call:accepted', { to: from, ans })
  }, [socket])

  const sendStreams = useCallback(() => {
    for (const track of myStream.getTracks()) {
      peer.peer.addTrack(track, myStream)
    }
  }, [myStream])

  const handleCallAccepted = useCallback(({ from, ans }) => {
    peer.setLocalDescription(ans)
    console.log('Call Accepted')
    sendStreams()
  }, [sendStreams])

  const handleNegoNeeded = useCallback(async () => {
    const offer = await peer.getOffer()
    socket.emit('peer:nego:needed', { offer, to: remoteSocketId })
  }, [remoteSocketId, socket])

  const handleNegoNeededIncoming = useCallback(async ({ from, offer } ) => {
    const ans = await peer.getAnswer(offer)
    socket.emit('peer:nego:done', { to: from, ans })
  }, [socket])

  const handleNegoNeededFinal = useCallback(async ({ ans }) => {
    await peer.setLocalDescription(ans)
  }, [])

  useEffect(() => {
    peer.peer.addEventListener('negotiationneeded', handleNegoNeeded)
    return () => {
      peer.peer.removeEventListener('negotiationneeded', handleNegoNeeded)
    }
  }, [handleNegoNeeded])

  useEffect(() => {
    peer.peer.addEventListener('track', async (ev) => {
      const remoteStream = ev.streams
      console.log('GOT TRACKS!')
      setRemoteStream(remoteStream[0])
    })
  }, [])

  useEffect(() => {
    socket.on('user:joined', handleUserJoined)
    socket.on('incomming:call', handleIncommingCall)
    socket.on('call:accepted', handleCallAccepted)
    socket.on('peer:nego:needed', handleNegoNeededIncoming)
    socket.on('peer:nego:final', handleNegoNeededFinal)
    return () => {
      socket.off('user:joined', handleUserJoined)
      socket.off('incomming:call', handleIncommingCall)
      socket.off('call:accepted', handleCallAccepted)
      socket.off('peer:nego:needed', handleNegoNeededIncoming)
      socket.off('peer:nego:final', handleNegoNeededFinal)
    }
  }, [socket, handleUserJoined, handleIncommingCall, handleCallAccepted, handleNegoNeededIncoming, handleNegoNeededFinal])

  if (!props.active) return null
  return (
    <div>
      <h1>Room</h1>
      <h4>{remoteSocketId ? 'Someone connected': 'Noone else'}</h4>
      {remoteSocketId && <button onClick={handleCallUser}>Call</button>}
      {myStream && <button onClick={sendStreams}>Send Streams</button>}
      {myStream && (
        <>
          <h4>My Stream</h4>
          <ReactPlayer muted height={'100%'} width={'100%'} playing={true} url={myStream} />
        </>
      )}
      {remoteStream && (
        <>
          <h4>Remote Stream</h4>
          <ReactPlayer muted height={'100%'} width={'100%'} playing={true} url={remoteStream} />
        </>
      )}
    </div>
  )
}

export default Room