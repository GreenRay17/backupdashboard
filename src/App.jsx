import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import React from 'react';
import BackupTable from './BackupTable';

function App() {
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Rapport de Sauvegarde</h1>
      <BackupTable />
    </div>
  );
}

export default App
