import { createRoot } from 'react-dom/client'
// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import '../styles/_index.scss'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(<App />)
