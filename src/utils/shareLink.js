import pako from 'pako';

// Encode data to a compressed base64 string for URL sharing
export function encodeShareData(data) {
  try {
    const json = JSON.stringify(data);
    const compressed = pako.deflate(json);
    const base64 = btoa(String.fromCharCode(...compressed));
    // URL-safe base64
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  } catch (e) {
    console.error('Share encode error:', e);
    return null;
  }
}

// Decode a compressed base64 string back to data
export function decodeShareData(encoded) {
  try {
    // Restore standard base64
    let base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) base64 += '=';
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const decompressed = pako.inflate(bytes, { to: 'string' });
    return JSON.parse(decompressed);
  } catch (e) {
    console.error('Share decode error:', e);
    return null;
  }
}

// Generate a full share URL for a tool
export function generateShareURL(toolPath, data) {
  const encoded = encodeShareData(data);
  if (!encoded) return null;
  const base = window.location.origin + window.location.pathname;
  return `${base}#${toolPath}?d=${encoded}`;
}

// Parse share data from current URL hash
export function parseShareFromURL() {
  const hash = window.location.hash;
  if (!hash) return null;
  const match = hash.match(/\?d=(.+)$/);
  if (!match) return null;
  return decodeShareData(match[1]);
}

// Copy share link to clipboard
export async function copyShareLink(toolPath, data) {
  const url = generateShareURL(toolPath, data);
  if (url) {
    await navigator.clipboard.writeText(url);
    return true;
  }
  return false;
}
