/**
 * Real-Time Collaboration Hooks
 * Inspired by Figma Clone patterns for syncing cursors and elements
 * Ready for Supabase Realtime or WebSocket integration
 */

import { useEffect, useCallback, useRef, useState } from 'react';

export interface RemoteUserCursor {
  userId: string;
  x: number;
  y: number;
  color: string;
  label: string;
  isActive: boolean;
}

export interface SyncedElement {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  zIndex: number;
  content?: string;
  timestamp: number;
  userId: string;
}

export interface CollaborationState {
  remoteCursors: Map<string, RemoteUserCursor>;
  localUserId: string;
  isConnected: boolean;
  syncLatency: number;
}

/**
 * Hook for cursor position broadcasting
 * Shares user's cursor position with other clients
 */
export const useCursorBroadcast = (_userId: string, enabled: boolean = true) => {
  const [cursorTrackingEnabled, setCursorTrackingEnabled] = useState(enabled);
  const lastBroadcastTimeRef = useRef<number>(0);
  const BROADCAST_THROTTLE = 30; // ms (for 60fps ~30ms per frame)

  const broadcastCursor = useCallback(
    (x: number, y: number, callback?: (position: { x: number; y: number }) => void) => {
      const now = performance.now();

      // Throttle broadcasts to reduce network traffic
      if (now - lastBroadcastTimeRef.current < BROADCAST_THROTTLE) {
        return;
      }

      lastBroadcastTimeRef.current = now;

      // Emit to WebSocket/Supabase
      callback?.({ x, y });
    },
    []
  );

  return {
    broadcastCursor,
    cursorTrackingEnabled,
    setCursorTrackingEnabled,
  };
};

/**
 * Hook for element synchronization
 * Syncs element updates across clients with conflict resolution
 */
export const useElementSync = (
  _elementId: string,
  userId: string,
  onRemoteUpdate?: (element: SyncedElement) => void
) => {
  const lastSyncTimeRef = useRef<number>(0);
  const SYNC_THROTTLE = 50; // ms

  const syncElement = useCallback(
    (element: Omit<SyncedElement, 'timestamp' | 'userId'>) => {
      const now = performance.now();

      // Throttle syncs
      if (now - lastSyncTimeRef.current < SYNC_THROTTLE) {
        return;
      }

      lastSyncTimeRef.current = now;

      const syncedElement: SyncedElement = {
        ...element,
        userId,
        timestamp: now,
      };

      // Emit to WebSocket/Supabase
      return syncedElement;
    },
    [userId]
  );

  return { syncElement, onRemoteUpdate };
};

/**
 * Hook for managing remote user cursors
 */
export const useRemoteCursors = () => {
  const [remoteCursors, setRemoteCursors] = useState<Map<string, RemoteUserCursor>>(
    new Map()
  );

  const updateRemoteCursor = useCallback(
    (userId: string, cursor: RemoteUserCursor) => {
      setRemoteCursors((prev) => {
        const next = new Map(prev);
        next.set(userId, cursor);
        return next;
      });
    },
    []
  );

  const removeRemoteCursor = useCallback((userId: string) => {
    setRemoteCursors((prev) => {
      const next = new Map(prev);
      next.delete(userId);
      return next;
    });
  }, []);

  const clearRemoteCursors = useCallback(() => {
    setRemoteCursors(new Map());
  }, []);

  return {
    remoteCursors,
    updateRemoteCursor,
    removeRemoteCursor,
    clearRemoteCursors,
  };
};

/**
 * Hook for WebSocket/Realtime connection management
 */
interface RealtimeConfig {
  url?: string;
  userId: string;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onCursorUpdate?: (userId: string, cursor: RemoteUserCursor) => void;
  onElementUpdate?: (element: SyncedElement) => void;
}

export const useRealtimeSync = (config: RealtimeConfig) => {
  const [isConnected, setIsConnected] = useState(false);
  const [syncLatency, setSyncLatency] = useState(0);
  const wsRef = useRef<WebSocket | null>(null);
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastPingTimeRef = useRef<number>(0);

  // Initialize connection
  useEffect(() => {
    if (!config.url) return;

    const connectWebSocket = () => {
      try {
        wsRef.current = new WebSocket(config.url!);

        wsRef.current.onopen = () => {
          setIsConnected(true);
          config.onConnect?.();

          // Start ping/pong for latency tracking
          pingIntervalRef.current = setInterval(() => {
            if (wsRef.current?.readyState === WebSocket.OPEN) {
              lastPingTimeRef.current = performance.now();
              wsRef.current.send(JSON.stringify({ type: 'ping' }));
            }
          }, 5000);
        };

        wsRef.current.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);

            if (data.type === 'pong') {
              const latency = performance.now() - lastPingTimeRef.current;
              setSyncLatency(Math.round(latency / 2)); // Round trip / 2
            } else if (data.type === 'cursor') {
              config.onCursorUpdate?.(data.userId, data.cursor);
            } else if (data.type === 'element') {
              config.onElementUpdate?.(data.element);
            }
          } catch (error) {
            console.error('Failed to parse message:', error);
          }
        };

        wsRef.current.onclose = () => {
          setIsConnected(false);
          config.onDisconnect?.();

          // Attempt reconnection after 3 seconds
          setTimeout(connectWebSocket, 3000);
        };

        wsRef.current.onerror = (error) => {
          console.error('WebSocket error:', error);
        };
      } catch (error) {
        console.error('Failed to create WebSocket:', error);
      }
    };

    connectWebSocket();

    return () => {
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [config]);

  const send = useCallback((message: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  }, []);

  return {
    isConnected,
    syncLatency,
    send,
  };
};

/**
 * Hook for presence tracking (who's online)
 */
export interface UserPresence {
  userId: string;
  name: string;
  color: string;
  lastSeen: number;
  isActive: boolean;
}

export const usePresenceTracking = () => {
  const [activeUsers, setActiveUsers] = useState<Map<string, UserPresence>>(
    new Map()
  );

  const updatePresence = useCallback((presence: UserPresence) => {
    setActiveUsers((prev) => {
      const next = new Map(prev);
      next.set(presence.userId, presence);
      return next;
    });
  }, []);

  const removePresence = useCallback((userId: string) => {
    setActiveUsers((prev) => {
      const next = new Map(prev);
      next.delete(userId);
      return next;
    });
  }, []);

  // Auto-cleanup inactive users after 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setActiveUsers((prev) => {
        const next = new Map(prev);
        for (const [userId, user] of next.entries()) {
          if (now - user.lastSeen > 30000) {
            next.delete(userId);
          }
        }
        return next;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return {
    activeUsers,
    updatePresence,
    removePresence,
  };
};

/**
 * Hook for conflict resolution in collaborative editing
 * Uses Last-Write-Wins (LWW) strategy
 */
export const useConflictResolution = () => {
  const resolveConflict = useCallback(
    (
      localElement: SyncedElement,
      remoteElement: SyncedElement
    ): SyncedElement => {
      // Last-Write-Wins: use element with latest timestamp
      if (remoteElement.timestamp > localElement.timestamp) {
        return remoteElement;
      }
      return localElement;
    },
    []
  );

  return { resolveConflict };
};

/**
 * Hook for undo/redo with collaborative awareness
 */
export interface HistoryEntry {
  id: string;
  action: 'create' | 'update' | 'delete';
  element: SyncedElement;
  userId: string;
  timestamp: number;
}

export const useCollaborativeHistory = (maxHistory: number = 50) => {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);

  const addToHistory = useCallback((entry: HistoryEntry) => {
    setHistory((prev) => {
      const newHistory = prev.slice(0, currentIndex + 1);
      newHistory.push(entry);
      if (newHistory.length > maxHistory) {
        newHistory.shift();
      }
      return newHistory;
    });
    setCurrentIndex((prev) => prev + 1);
  }, [currentIndex, maxHistory]);

  const undo = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  const redo = useCallback(() => {
    if (currentIndex < history.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  }, [currentIndex, history.length]);

  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;

  return {
    history,
    currentIndex,
    addToHistory,
    undo,
    redo,
    canUndo,
    canRedo,
  };
};

/**
 * Batch updates for efficient network communication
 */
export const useBatchUpdates = (
  onBatch: (updates: SyncedElement[]) => void,
  batchInterval: number = 100
) => {
  const batchRef = useRef<Map<string, SyncedElement>>(new Map());
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const addToBatch = useCallback(
    (element: SyncedElement) => {
      batchRef.current.set(element.id, element);

      // Schedule batch send
      if (!timeoutRef.current) {
        timeoutRef.current = setTimeout(() => {
          const updates = Array.from(batchRef.current.values());
          if (updates.length > 0) {
            onBatch(updates);
            batchRef.current.clear();
          }
          timeoutRef.current = null;
        }, batchInterval);
      }
    },
    [onBatch, batchInterval]
  );

  const flush = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    const updates = Array.from(batchRef.current.values());
    if (updates.length > 0) {
      onBatch(updates);
      batchRef.current.clear();
    }
  }, [onBatch]);

  return { addToBatch, flush };
};
