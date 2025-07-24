# PlannerApp

A modern, feature-rich task and project management app built with React Native and Expo Router.

![React Native](https://img.shields.io/badge/React%20Native-0.76.5-blue.svg)
![Expo](https://img.shields.io/badge/Expo-~52.0.21-black.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3.3-blue.svg)

## Features

- **Dashboard**: Real-time project and task statistics with interactive cards
- **Task Management**: Create, edit, update status, and delete tasks
- **Project Organization**: Organize tasks by projects
- **Quick Actions**: Fast status updates (Pending, In Progress, Completed)
- **Modern UI**: Clean, intuitive interface with Ionicons
- **Cross-Platform**: Runs on iOS, Android, and Web
- **Real-time Updates**: Dynamic data loading with refresh capabilities
- **Error Handling**: Robust error handling with user feedback
- **API Integration**: Mock data support with real API fallback

## Getting Started

### Prerequisites

- Node.js (16 or newer)
- npm or yarn
- Expo CLI

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/taylandeveci/PlannerApp.git
   cd PlannerApp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npx expo start
   ```

4. **Run on your preferred platform**
   - **Web**: Press `w` in the terminal or open http://localhost:8081
   - **iOS Simulator**: Press `i` (requires Xcode on macOS)
   - **Android Emulator**: Press `a` (requires Android Studio)
   - **Physical Device**: Scan QR code with Expo Go app

## Screenshots & Demo

- **Dashboard**: Interactive stats cards showing project and task counts
- **Task Details**: Comprehensive task view with quick action buttons
- **Status Management**: Easy status updates with visual feedback
- **Responsive Design**: Works seamlessly across all screen sizes

## Project Structure

```
PlannerApp/
├── app/                    # Main application code
│   ├── (tabs)/            # Tab-based navigation
│   │   ├── index.tsx      # Dashboard screen
│   │   ├── tasks/         # Task-related screens
│   │   └── projects/      # Project-related screens
│   └── _layout.tsx        # Root layout
├── components/            # Reusable UI components
├── lib/                   # Utilities and services
│   └── apiService.ts      # API service with mock data
├── types/                 # TypeScript type definitions
└── assets/               # Images, fonts, and other assets
```

## Tech Stack

- **Framework**: React Native with Expo
- **Navigation**: Expo Router (file-based routing)
- **Language**: TypeScript
- **Icons**: Expo Vector Icons (Ionicons)
- **HTTP Client**: Axios
- **State Management**: React Hooks
- **Styling**: React Native StyleSheet

## Key Components

### Dashboard
- Real-time project and task statistics
- Clickable navigation cards
- Pull-to-refresh functionality

### Task Management
- Full CRUD operations
- Status tracking (Pending, In Progress, Completed)
- Priority levels and due dates
- Quick action buttons

### API Service
- Mock data for development
- Fallback to real API when available
- Consistent error handling

## Configuration

The app uses a flexible API service that supports both mock data and real API endpoints. Configure your API base URL in `lib/apiService.ts`:

```typescript
const API_BASE_URL = 'http://localhost:5144/api';
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with [Expo](https://expo.dev)
- Icons by [Expo Vector Icons](https://docs.expo.dev/guides/icons/)
- UI inspiration from modern task management apps

## Contact

Taylan Deveci - taylandeveci@example.com

Project Link: [https://github.com/taylandeveci/PlannerApp](https://github.com/taylandeveci/PlannerApp)