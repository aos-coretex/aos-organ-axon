/**
 * React hook for consuming Spine broadcast events via Axon's UI WebSocket.
 *
 * Usage:
 *   const { connected, lastEvent, subscribe } = useSpineEvents();
 *
 *   // Subscribe to specific event types
 *   useEffect(() => {
 *     const unsub = subscribe('verification_result', (data) => {
 *       console.log('New test result:', data);
 *     });
 *     return unsub;
 *   }, [subscribe]);
 */

import { useState, useEffect, useRef, useCallback } from 'react';

const RECONNECT_BASE = 1000;
const RECONNECT_MAX = 30000;

export default function useSpineEvents() {
  const [connected, setConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState(null);
  const listenersRef = useRef(new Map());
  const wsRef = useRef(null);
  const reconnectAttemptRef = useRef(0);
  const reconnectTimerRef = useRef(null);

  const connect = useCallback(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      reconnectAttemptRef.current = 0;
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        setLastEvent(msg);

        // Dispatch to type-specific listeners
        const typeListeners = listenersRef.current.get(msg.type);
        if (typeListeners) {
          for (const cb of typeListeners) {
            try { cb(msg.data); } catch { /* listener error isolation */ }
          }
        }

        // Dispatch to wildcard listeners
        const wildcardListeners = listenersRef.current.get('*');
        if (wildcardListeners) {
          for (const cb of wildcardListeners) {
            try { cb(msg); } catch { /* listener error isolation */ }
          }
        }
      } catch {
        // Ignore non-JSON messages
      }
    };

    ws.onclose = () => {
      setConnected(false);
      wsRef.current = null;
      scheduleReconnect();
    };

    ws.onerror = () => {
      // onclose will fire after onerror
    };
  }, []);

  function scheduleReconnect() {
    const delay = Math.min(
      RECONNECT_BASE * Math.pow(2, reconnectAttemptRef.current),
      RECONNECT_MAX,
    );
    reconnectAttemptRef.current += 1;
    reconnectTimerRef.current = setTimeout(connect, delay);
  }

  // Subscribe to a specific event type (or '*' for all)
  const subscribe = useCallback((eventType, callback) => {
    if (!listenersRef.current.has(eventType)) {
      listenersRef.current.set(eventType, new Set());
    }
    listenersRef.current.get(eventType).add(callback);

    // Return unsubscribe function
    return () => {
      const set = listenersRef.current.get(eventType);
      if (set) {
        set.delete(callback);
        if (set.size === 0) listenersRef.current.delete(eventType);
      }
    };
  }, []);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      if (wsRef.current) wsRef.current.close();
    };
  }, [connect]);

  return { connected, lastEvent, subscribe };
}
