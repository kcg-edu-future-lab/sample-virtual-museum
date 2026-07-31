import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import type { InfoObject } from './models/InfoObjectsModel.ts';

const response = await fetch("infoobjects.json");
if (!response.ok) throw new Error(`Failed to load infoobjects.json: ${response.status}`);
const data = await response.json() as {infoObjects: InfoObject[]};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App infoObjects={data.infoObjects} />
  </StrictMode>,
)
