/**
 * Backend Integration Guide
 * Setup for certificate editor with real-time collaboration
 *
 * Supports: Supabase Realtime (PostgreSQL), WebSocket, or REST APIs
 */

/**
 * OPTION 1: Supabase Realtime (Recommended)
 * Real-time pubsub with PostgreSQL backend
 */

// backend/supabase/schema.sql
export const SUPABASE_SCHEMA = `
-- Users table (if not using Supabase Auth)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Templates table (certificate templates)
CREATE TABLE IF NOT EXISTS templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- Collaborators table (multi-user edit tracking)
CREATE TABLE IF NOT EXISTS collaborators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'viewer', -- 'editor' | 'viewer' | 'owner'
  cursor_x REAL,
  cursor_y REAL,
  cursor_color TEXT,
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(template_id, user_id)
);

-- Elements table (individual elements on canvas)
CREATE TABLE IF NOT EXISTS template_elements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
  element_id TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id),
  data JSONB NOT NULL,
  version INT DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(template_id, element_id)
);

-- Change history for undo/redo
CREATE TABLE IF NOT EXISTS change_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  action TEXT NOT NULL, -- 'create' | 'update' | 'delete'
  element_id TEXT,
  prev_data JSONB,
  new_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_elements ENABLE ROW LEVEL SECURITY;
ALTER TABLE change_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own templates"
  ON templates
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create templates"
  ON templates
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Collaborators can view templates"
  ON templates
  FOR SELECT
  USING (EXISTS(
    SELECT 1 FROM collaborators
    WHERE template_id = id AND user_id = auth.uid()
  ));

CREATE POLICY "Editors can update templates"
  ON templates
  FOR UPDATE
  USING (
    user_id = auth.uid() OR EXISTS(
      SELECT 1 FROM collaborators
      WHERE template_id = id
        AND user_id = auth.uid()
        AND role = 'editor'
    )
  );

-- Realtime subscriptions
ALTER PUBLICATION supabase_realtime ADD TABLE templates;
ALTER PUBLICATION supabase_realtime ADD TABLE collaborators;
ALTER PUBLICATION supabase_realtime ADD TABLE template_elements;
`;

/**
 * OPTION 2: WebSocket Server (Node.js with ws)
 */

// backend/websocket-server.ts
export const WEBSOCKET_SERVER_EXAMPLE = `
import WebSocket from 'ws';
import { v4 as uuidv4 } from 'uuid';

interface ClientMessage {
  type: 'cursor' | 'element' | 'presence' | 'sync';
  userId: string;
  templateId: string;
  payload: any;
}

interface ActiveUser {
  id: string;
  name: string;
  color: string;
  cursor: { x: number; y: number };
  lastSeen: number;
}

const wss = new WebSocket.Server({ port: 8080 });
const activeUsers = new Map<string, ActiveUser>();
const templateSubscribers = new Map<string, Set<WebSocket>>();

wss.on('connection', (ws) => {
  let currentUserId: string;
  let currentTemplateId: string;

  ws.on('message', (data: string) => {
    const message: ClientMessage = JSON.parse(data);

    switch (message.type) {
      case 'presence':
        // User joined
        currentUserId = message.userId;
        currentTemplateId = message.templateId;

        const user: ActiveUser = {
          id: currentUserId,
          name: message.payload.name,
          color: message.payload.color,
          cursor: { x: 0, y: 0 },
          lastSeen: Date.now(),
        };

        activeUsers.set(currentUserId, user);

        // Subscribe to template updates
        if (!templateSubscribers.has(currentTemplateId)) {
          templateSubscribers.set(currentTemplateId, new Set());
        }
        templateSubscribers.get(currentTemplateId)!.add(ws);

        // Broadcast to other users
        broadcastToTemplate(currentTemplateId, {
          type: 'user-joined',
          user,
        });
        break;

      case 'cursor':
        // Update cursor position
        const user = activeUsers.get(currentUserId);
        if (user) {
          user.cursor = message.payload;
          user.lastSeen = Date.now();

          // Broadcast cursor to all subscribers
          broadcastToTemplate(currentTemplateId, {
            type: 'cursor-update',
            userId: currentUserId,
            cursor: message.payload,
          });
        }
        break;

      case 'element':
        // Element updated
        broadcastToTemplate(currentTemplateId, {
          type: 'element-update',
          userId: currentUserId,
          element: message.payload,
        });
        break;

      case 'sync':
        // Request full sync
        ws.send(JSON.stringify({
          type: 'full-sync',
          users: Array.from(activeUsers.values()),
        }));
        break;
    }
  });

  ws.on('close', () => {
    // User left
    if (currentUserId && currentTemplateId) {
      activeUsers.delete(currentUserId);
      broadcastToTemplate(currentTemplateId, {
        type: 'user-left',
        userId: currentUserId,
      });
    }
  });
});

function broadcastToTemplate(templateId: string, message: any) {
  const subscribers = templateSubscribers.get(templateId);
  if (subscribers) {
    subscribers.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(message));
      }
    });
  }
}
`;

/**
 * OPTION 3: REST API + Polling
 * Simpler setup for non-real-time updates
 */

export const REST_API_EXAMPLE = `
// Endpoints needed:

// GET /api/templates/:id
// Returns full template with all elements
// Used for initial load

// PATCH /api/templates/:id
// Updates template metadata
// Body: { name, description, data }

// POST /api/templates/:id/elements
// Create new element
// Body: { elementId, data }

// PATCH /api/templates/:id/elements/:elementId
// Update element
// Body: { data, version }

// DELETE /api/templates/:id/elements/:elementId
// Delete element

// GET /api/templates/:id/presence
// Get active users (poll every 5 seconds)
// Response: { users: [{ id, name, color, cursor, lastSeen }] }

// POST /api/templates/:id/presence
// Update own cursor/presence
// Body: { cursor: { x, y }, name, color }
`;

/**
 * Frontend Integration with Supabase
 */

export const FRONTEND_SUPABASE_INTEGRATION = `
// hooks/useSupabaseCollaboration.ts

import { useEffect, useRef, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useEditorStore } from '@/store/useEditorStore';
import {
  useBatchUpdates,
  useRemoteCursors,
  usePresenceTracking,
} from '@/hooks/useRealtimeCollaboration';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const useSupabaseCollaboration = (templateId: string, userId: string) => {
  const { remoteCursors, updateRemoteCursor, removeRemoteCursor } = useRemoteCursors();
  const { activeUsers, updatePresence } = usePresenceTracking();
  const updateElement = useEditorStore((state) => state.updateElement);
  const channelRef = useRef<any>(null);

  // Setup real-time subscriptions
  useEffect(() => {
    // Subscribe to cursor updates
    channelRef.current = supabase.channel(\`template:\${templateId}\`);

    channelRef.current
      .on(
        'broadcast',
        { event: 'cursor' },
        (payload) => {
          updateRemoteCursor(payload.payload.userId, {
            userId: payload.payload.userId,
            x: payload.payload.x,
            y: payload.payload.y,
            color: payload.payload.color,
            label: payload.payload.name,
            isActive: true,
          });
        }
      )
      .on(
        'broadcast',
        { event: 'element' },
        (payload) => {
          updateElement(payload.payload.elementId, payload.payload.data);
        }
      )
      .on(
        'broadcast',
        { event: 'user-joined' },
        (payload) => {
          updatePresence({
            userId: payload.payload.userId,
            name: payload.payload.name,
            color: payload.payload.color,
            lastSeen: Date.now(),
            isActive: true,
          });
        }
      )
      .subscribe();

    return () => {
      channelRef.current?.unsubscribe();
    };
  }, [templateId]);

  // Broadcast cursor
  const broadcastCursor = useCallback(
    (x: number, y: number) => {
      channelRef.current?.send({
        type: 'broadcast',
        event: 'cursor',
        payload: {
          userId,
          x,
          y,
          color: '#6699FF',
          name: 'You',
        },
      });
    },
    [userId]
  );

  // Sync element updates
  const syncElement = useCallback(
    (element: any) => {
      channelRef.current?.send({
        type: 'broadcast',
        event: 'element',
        payload: {
          userId,
          elementId: element.id,
          data: element,
        },
      });
    },
    [userId]
  );

  return {
    broadcastCursor,
    syncElement,
    remoteCursors,
    activeUsers,
  };
};
`;

/**
 * Implementation Steps
 */

export const IMPLEMENTATION_STEPS = \`
## Step 1: Choose Backend Option

Options:
- Supabase (easiest, built-in real-time)
- WebSocket (more control, custom server)
- REST + Polling (simplest, eventual consistency)

Recommendation: Start with Supabase for MVP.

## Step 2: Set up Database

If using Supabase:
1. Create database schema (see SUPABASE_SCHEMA above)
2. Enable Row Level Security
3. Create auth policies

## Step 3: Create Backend API

If using REST:
1. Create endpoints for CRUD operations
2. Implement conflict resolution
3. Add authentication middleware

## Step 4: Integrate in Frontend

1. Install Supabase client:
   npm install @supabase/supabase-js

2. Wrap Canvas in collaboration hook:
   import { useSupabaseCollaboration } from '@/hooks/useSupabaseCollaboration';

3. Listen to cursor broadcasts in Canvas:
   const { broadcastCursor, remoteCursors } = useSupabaseCollaboration(...);

4. Sync element updates:
   const { syncElement } = useSupabaseCollaboration(...);

## Step 5: Test Multi-User Setup

1. Open template in two browser windows
2. Move cursor in one window
3. Verify cursor appears in other window
4. Drag element in one window
5. Verify update appears in other window

\`;

/**
 * Conflict Resolution Strategy: Last-Write-Wins (LWW)
 * Best for design tools where latest action wins
 */

export const CONFLICT_RESOLUTION = \`
// When two users edit same element simultaneously:

User A (12:00:05) → Moves element to x=100
User B (12:00:06) → Moves element to x=200

Storage (12:00:07):
- Both operations have timestamps
- LWW chooses User B's change (12:00:06 > 12:00:05)
- Result: x=200 (User B wins)

For critical operations (delete), use:
- Operational Transform (OT)
- Conflict-free Replicated Data Types (CRDT)

But for design tools, LWW is sufficient and simpler.
\`;

export default {
  SUPABASE_SCHEMA,
  WEBSOCKET_SERVER_EXAMPLE,
  REST_API_EXAMPLE,
  FRONTEND_SUPABASE_INTEGRATION,
  IMPLEMENTATION_STEPS,
  CONFLICT_RESOLUTION,
};
