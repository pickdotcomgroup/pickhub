# Messaging Feature Documentation

## Overview

The messaging feature enables real-time communication between clients and talents on the TechPickHub platform. This feature allows clients to message talents they're interested in hiring, and talents to communicate with potential clients about projects.

## Features

### Core Functionality
- **One-on-one conversations** between clients and talents
- **Real-time messaging** with message history
- **Unread message indicators** to track new messages
- **Conversation list** showing all active conversations
- **Message timestamps** for all messages
- **Auto-read marking** when viewing messages
- **Project-specific conversations** (optional linking to projects)

### User Experience
- Clean, modern messaging interface
- Responsive design for mobile and desktop
- Easy conversation initiation from talent browse page
- Navigation links in header for quick access
- Visual indicators for unread messages

## Database Schema

### Conversation Model
```prisma
model Conversation {
  id           String    @id @default(cuid())
  
  // Participants
  clientId     String
  client       User      @relation("ClientConversations")
  
  talentId     String
  talent       User      @relation("TalentConversations")
  
  // Optional: Link to a specific project
  projectId    String?
  
  messages     Message[]
  
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
  
  @@unique([clientId, talentId, projectId])
}
```

### Message Model
```prisma
model Message {
  id             String       @id @default(cuid())
  content        String       @db.Text
  
  conversationId String
  conversation   Conversation @relation(...)
  
  senderId       String
  sender         User         @relation(...)
  
  isRead         Boolean      @default(false)
  
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt
}
```

## API Endpoints

### Conversations API (`/api/conversations`)

#### GET - List Conversations
Retrieves all conversations for the authenticated user.

**Response:**
```json
[
  {
    "id": "conversation_id",
    "clientId": "client_user_id",
    "talentId": "talent_user_id",
    "projectId": "project_id_or_null",
    "client": { /* user details */ },
    "talent": { /* user details */ },
    "messages": [ /* last message */ ],
    "_count": {
      "messages": 5  // unread count
    },
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

#### POST - Create/Get Conversation
Creates a new conversation or retrieves an existing one between two users.

**Request Body:**
```json
{
  "otherUserId": "user_id",
  "projectId": "project_id" // optional
}
```

**Response:**
```json
{
  "id": "conversation_id",
  "clientId": "client_user_id",
  "talentId": "talent_user_id",
  "projectId": "project_id_or_null",
  "client": { /* user details */ },
  "talent": { /* user details */ }
}
```

### Messages API (`/api/messages`)

#### GET - Get Messages
Retrieves all messages for a specific conversation.

**Query Parameters:**
- `conversationId` (required): The conversation ID

**Response:**
```json
[
  {
    "id": "message_id",
    "content": "Message text",
    "conversationId": "conversation_id",
    "senderId": "sender_user_id",
    "sender": { /* user details */ },
    "isRead": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

**Side Effect:** Automatically marks unread messages as read for the current user.

#### POST - Send Message
Sends a new message in a conversation.

**Request Body:**
```json
{
  "conversationId": "conversation_id",
  "content": "Message text"
}
```

**Response:**
```json
{
  "id": "message_id",
  "content": "Message text",
  "conversationId": "conversation_id",
  "senderId": "sender_user_id",
  "sender": { /* user details */ },
  "isRead": false,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

## User Interface

### Client Messages Page (`/client/messages`)
- **Location:** `src/app/client/messages/page.tsx`
- **Features:**
  - List of all conversations with talents
  - Unread message count badges
  - Last message preview
  - Full message thread view
  - Message input with send functionality
  - Real-time message display

### Talent Messages Page (`/talent/messages`)
- **Location:** `src/app/talent/messages/page.tsx`
- **Features:**
  - List of all conversations with clients
  - Unread message count badges
  - Last message preview
  - Full message thread view
  - Message input with send functionality
  - Real-time message display

### Browse Page Integration
- **Location:** `src/app/client/browse/page.tsx`
- **Feature:** "Message" button on each talent card
- **Functionality:** Creates conversation and redirects to messages page

## Navigation

The messaging feature is accessible through:
1. **Header Navigation:** "Messages" link in the main navigation
2. **Browse Page:** "Message" button on talent cards (for clients)
3. **Direct URL:** `/client/messages` or `/talent/messages`

## Security

### Authentication
- All API endpoints require authentication
- Users must be logged in to access messaging features

### Authorization
- Users can only view conversations they're part of
- Messages can only be sent in conversations the user belongs to
- Conversation creation validates user roles (client + talent)

### Data Validation
- Message content is required and validated
- Conversation IDs are verified before operations
- User permissions are checked on every request

## Usage Examples

### Starting a Conversation (Client)
1. Navigate to Browse Talents page
2. Find a talent you want to message
3. Click the "Message" button on their card
4. You'll be redirected to the messages page with the conversation ready

### Sending a Message
1. Navigate to Messages page
2. Select a conversation from the list
3. Type your message in the input field
4. Click "Send" or press Enter
5. Message appears in the thread immediately

### Viewing Unread Messages
1. Navigate to Messages page
2. Conversations with unread messages show a blue badge with count
3. Click on a conversation to view messages
4. Messages are automatically marked as read when viewed

## Future Enhancements

Potential improvements for the messaging feature:

1. **Real-time Updates:** WebSocket integration for instant message delivery
2. **File Attachments:** Support for sending images and documents
3. **Message Reactions:** Emoji reactions to messages
4. **Message Search:** Search within conversations
5. **Typing Indicators:** Show when the other person is typing
6. **Message Notifications:** Email/push notifications for new messages
7. **Message Editing:** Edit sent messages within a time window
8. **Message Deletion:** Delete messages from conversation
9. **Conversation Archiving:** Archive old conversations
10. **Group Conversations:** Support for multi-party conversations

## Troubleshooting

### Messages Not Appearing
- Check browser console for errors
- Verify authentication status
- Ensure conversation exists and user has access

### Cannot Send Messages
- Verify conversation ID is valid
- Check that message content is not empty
- Ensure user is authenticated and authorized

### Unread Count Not Updating
- Refresh the conversations list
- Check that messages are being marked as read
- Verify database connection

## Technical Notes

### Database Indexes
The schema includes indexes on:
- `conversationId` in Message model
- `senderId` in Message model
- `createdAt` in Message model
- `clientId` in Conversation model
- `talentId` in Conversation model

These indexes optimize query performance for:
- Fetching messages by conversation
- Finding conversations by user
- Ordering messages chronologically

### Unique Constraints
- One conversation per client-talent-project combination
- Prevents duplicate conversations for the same context

### Cascade Deletes
- Deleting a user cascades to their conversations and messages
- Deleting a conversation cascades to its messages
- Ensures data integrity and prevents orphaned records
