import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import cssText from './index.css?inline'

const host = document.getElementById('react-root') || document.getElementById('root');

if (host) {

    const shadow = host.attachShadow({ mode: 'open' });


    const style = document.createElement('style');
    style.textContent = cssText;
    shadow.appendChild(style);

    const reactContainer = document.createElement('div');
    shadow.appendChild(reactContainer);

    const root = createRoot(reactContainer);

    const mode = window.BOM_USER_MODE || 'short';
    console.log('Mode в React:', mode);

    root.render(
        <StrictMode>
            <App mode={mode} />
        </StrictMode>
    );
} else {
    console.warn('React root container not found.');
}
