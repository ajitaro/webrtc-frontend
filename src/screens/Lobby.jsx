import React, { useCallback, useEffect, useState } from 'react'
import { useSocket } from '../context/SocketProvider'
import Room from './Room'

const Lobby = () => {
  const [email, setEmail] = useState('')
  const [room, setRoom] = useState('')
  const [active, setActive] = useState(false)

  const socket = useSocket()

  const handleSubmitForm = useCallback((e) => {
    e.preventDefault()
    socket.emit('room:join', { email, room })
  }, [email, room, socket])

  const handleJoinRoom = useCallback((data) => {
    const { email, room } = data
    setActive(true)
    console.log('email', email)
    console.log('room', room)
  }, [])

  useEffect(() => {
    socket.on('room:join', handleJoinRoom)
    return () => {
      socket.off('room:join', handleJoinRoom)
    }
  }, [socket])

  return (
    <div>
      <h1>Lobby</h1>
      <form onSubmit={handleSubmitForm}>
        <label>Email ID</label>
        <input
          type="email"
          id='email'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <br />
        <label>Room</label>
        <input
          type='room'
          id='room'
          value={room}
          onChange={(e) => setRoom(e.target.value)}
        />
        <br />
        <button>Join</button>
      </form>
      <Room active={active} />
    </div>
  )
}

export default Lobby