## Project Structure

```
study-app/
├── app/                           # Screens + navigation (file-based)
│   ├── (auth)/                    # Logged-out flow
│   │   ├── login.tsx              # LoginScreen
│   │   ├── signup.tsx             # SignupScreen
│   │   └── _layout.tsx            # Auth stack layout
│   │
│   ├── (tabs)/                    # Logged-in app
│   │   ├── home/
│   │   │   ├── index.tsx          # HomeScreen
│   │   │   ├── HomeHeader.tsx
│   │   │   └── useHome.ts
│   │   │
│   │   ├── announcements/
│   │   │   ├── index.tsx          # AnnouncementsScreen
│   │   │   ├── AnnouncementCard.tsx
│   │   │   └── useAnnouncements.ts
│   │   │
│   │   ├── time-filter/
│   │   │   ├── index.tsx          # TimeFilterScreen
│   │   │   ├── CourseDropdown.tsx
|   |   |   ├── TimePicker.tsx
│   │   │   └── useTimeFilter.ts
│   │   │
│   │   ├── matching/
│   │   │   ├── index.tsx          # MatchingScreen
│   │   │   ├── MatchCard.tsx
│   │   │   └── useMatching.ts
|   |   |
|   |   ├──study-sessions/ 
|   |   |   ├── _layout.tsx        
|   |   |   ├── index.tsx          # SessionsScreen
|   |   |   ├── create_sessions.tsx
|   |   |   ├── session_details.tsx
│   │   │
│   │   └── _layout.tsx            # Bottom tabs
│   │
│   ├── _layout.tsx                # Root layout (auth gating)
│   └── index.tsx                  # Entry redirect
│
├── components/                    # Reusable UI (cross-screen)
│   ├── UserCard.tsx
│   ├── PrimaryButton.tsx
│   └── SectionHeader.tsx
│
├── hooks/                         # App-wide hooks
│   ├── useSession.ts
│   └── useProfile.ts
│
├── lib/                           # External services
│   ├── supabase.ts
│   └── api.ts
│
├── types/                         # Shared types
│   ├── models.ts
│   └── navigation.ts
│
├── constants/                     # Static config
│   ├── colors.ts
│   ├── spacing.ts
│   └── universities.ts
│
├── assets/                        # Images / fonts
│
├── backend/                       # Supabase / backend logic
│   ├── schema.sql
│   └── functions/
│
├── docs/                          # Specs
│   ├── tech-stack.md
│   └── matching-spec.md
│
├── .env
├── App.tsx
├── app.json
├── package.json
└── README.md
```

## app/ - Screens and Navigation (Expo Router)
Houses all full-screen routes and navigation logic using Expo Router's file-based routing. Every file or folder here corresponds to a user-facing screen or navigation boundary.

## app/(auth)/ - Logged-out Flow
Contains screens and layouts shown only to unauthenticated users, such as login and signup.
- `login.tsx`: The login screen where existing users authenticate
- `signup.tsx`: The signup screen for creating a new user account.
- `_layout.tsx`:Defines the navigation stack and layout for authentication screens.

## app/(tabs)/ - Main Logged-in Application
Contains all screens accessible after authentication and defines the bottom tab navigation.

- 
