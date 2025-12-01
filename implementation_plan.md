# Implementation Plan - My Chats Split View

## Goal Description
Redesign the `MyChats` page to display a list of chats on the left and the active chat interface on the right, eliminating the need to navigate to a separate page for chatting.

## User Review Required
> [!NOTE]
> This change will affect the mobile view. We will need to ensure it stacks correctly or maintains the current navigation behavior on small screens.

## Proposed Changes

### Components

#### [MODIFY] [ChatInterface.jsx](file:///c:/ANTONY2025/C4/CPS/front/cronos-frontend-react/src/pages/student/ChatInterface.jsx)
- Update to accept `characterId` and `onBack` as props.
- If props are provided, use them; otherwise, fall back to `useParams` (for direct URL access if needed).
- Adjust layout to fit within a container (remove full-screen fixed positioning if necessary).

#### [MODIFY] [MyChats.jsx](file:///c:/ANTONY2025/C4/CPS/front/cronos-frontend-react/src/pages/student/MyChats.jsx)
- Implement a 2-column grid layout (e.g., `grid-cols-12`).
- Left column (e.g., `col-span-4`): List of chats.
- Right column (e.g., `col-span-8`): `ChatInterface` or "Select a chat" placeholder.
- Manage `selectedChat` state.

## Verification Plan
### Manual Verification
- Open "Chats" from the dock.
- Verify list of chats appears on the left.
- Click a chat: Verify `ChatInterface` loads on the right without page reload.
- Verify "Call" button still works (might navigate to `CallInterface` which is likely still full screen).
