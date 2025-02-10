import { render } from 'preact'
import './index.css'
import './app.css'; // Asegura que el path sea correcto
import { App } from './app.jsx'

render(<App />, document.getElementById('app'))
