import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { getAdminSettings } from '../utils/storage';

export default function ScriptInjector() {
  const settings = getAdminSettings();
  const headerScripts = settings.headerScripts || '';
  const bodyScripts = settings.bodyScripts || '';

  // Body scripts: indsæt via DOM manipulation
  useEffect(() => {
    if (!bodyScripts.trim()) return;

    const container = document.createElement('div');
    container.id = 'admin-body-scripts';
    container.innerHTML = bodyScripts;

    // Aktivér scripts manuelt (innerHTML kører ikke scripts automatisk)
    const scripts = container.querySelectorAll('script');
    const liveScripts = [];

    scripts.forEach(oldScript => {
      const newScript = document.createElement('script');
      // Kopiér alle attributter
      Array.from(oldScript.attributes).forEach(attr => {
        newScript.setAttribute(attr.name, attr.value);
      });
      // Kopiér inline kode
      if (oldScript.textContent) {
        newScript.textContent = oldScript.textContent;
      }
      oldScript.replaceWith(newScript);
      liveScripts.push(newScript);
    });

    document.body.appendChild(container);

    return () => {
      // Cleanup ved unmount
      const el = document.getElementById('admin-body-scripts');
      if (el) el.remove();
    };
  }, [bodyScripts]);

  // Header scripts: brug Helmet til at indsætte i <head>
  if (!headerScripts.trim()) return null;

  // Parse header scripts til Helmet-kompatibelt format
  return (
    <Helmet>
      {parseHeaderScripts(headerScripts)}
    </Helmet>
  );
}

// Parser HTML-streng til Helmet-kompatible script-elementer
function parseHeaderScripts(html) {
  if (!html.trim()) return null;

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(`<head>${html}</head>`, 'text/html');
    const elements = [];

    doc.head.childNodes.forEach((node, i) => {
      if (node.nodeType !== 1) return; // Kun element-noder

      if (node.tagName === 'SCRIPT') {
        const attrs = {};
        Array.from(node.attributes).forEach(a => {
          // Konvertér HTML-attributter til React-props
          const key = a.name === 'class' ? 'className' : a.name;
          attrs[key] = a.value;
        });
        elements.push(
          <script key={`admin-head-${i}`} {...attrs}>
            {node.textContent || undefined}
          </script>
        );
      } else if (node.tagName === 'LINK') {
        const attrs = {};
        Array.from(node.attributes).forEach(a => {
          attrs[a.name] = a.value;
        });
        elements.push(<link key={`admin-head-${i}`} {...attrs} />);
      } else if (node.tagName === 'META') {
        const attrs = {};
        Array.from(node.attributes).forEach(a => {
          attrs[a.name] = a.value;
        });
        elements.push(<meta key={`admin-head-${i}`} {...attrs} />);
      } else if (node.tagName === 'STYLE') {
        elements.push(
          <style key={`admin-head-${i}`} type="text/css">
            {node.textContent}
          </style>
        );
      }
    });

    return elements.length > 0 ? elements : null;
  } catch {
    return null;
  }
}
