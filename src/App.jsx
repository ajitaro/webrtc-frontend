import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Lobby from './screens/Lobby'
import { SocketProvider } from './context/SocketProvider'

function App() {
  return (
    <SocketProvider>
      <Lobby />
    </SocketProvider>
  )
}

export default App
