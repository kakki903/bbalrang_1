# Workplace Personality Test - 직장 성향 테스트

## Overview

This is a frontend-only web application that provides a workplace personality test in Korean with English translation support. The application determines user personality types through 12 situational questions and provides detailed results with 9 different workplace character types. It features a responsive design with dark/light theme toggle and bilingual support.

## System Architecture

### Frontend Architecture
- **Single Page Application (SPA)**: Pure vanilla JavaScript implementation without frameworks
- **Responsive Design**: Bootstrap 5 for mobile-first responsive layout
- **Progressive Enhancement**: Graceful degradation for users with JavaScript disabled
- **Static File Serving**: All content served as static files (HTML, CSS, JS, JSON)

### Technology Stack
- **HTML5**: Semantic markup with proper meta tags for SEO
- **CSS3**: Custom properties for theming, CSS Grid/Flexbox for layout
- **Vanilla JavaScript**: ES6+ features with async/await for data loading
- **Bootstrap 5**: UI framework for responsive components
- **Font Awesome**: Icon library for enhanced UI elements
- **Google Fonts**: Noto Sans KR for Korean typography

## Key Components

### 1. Data Management
- **JSON-based Data Storage**: Questions, results, and translations stored in separate JSON files
- **Async Data Loading**: Promise-based loading of multiple data sources
- **Internationalization**: Complete translation system for Korean/English support

### 2. User Interface Components
- **Navigation Bar**: Fixed navigation with theme toggle and language switcher
- **Question Interface**: Progressive question display with option selection
- **Results Display**: Detailed personality analysis with visual ability charts
- **Theme System**: Dark/light mode with CSS custom properties

### 3. Core Logic
- **Scoring Algorithm**: Multi-dimensional scoring system across 9 personality types
- **State Management**: Class-based state management for quiz progression
- **Local Storage**: Persistent theme and language preferences

### 4. External Integrations
- **Kakao Share API**: Social sharing functionality for Korean users
- **Google AdSense**: Monetization through display advertising
- **Environment Variables**: Configuration management for API keys

## Data Flow

1. **Application Initialization**:
   - Load JSON data files (questions, results, translations)
   - Initialize scoring system with zero values
   - Apply saved user preferences (theme, language)

2. **Quiz Flow**:
   - Display questions sequentially
   - Collect user responses and update scores
   - Calculate final personality type based on highest score
   - Display comprehensive results with abilities and compatibility

3. **User Interactions**:
   - Theme toggle updates CSS custom properties
   - Language toggle switches all text content
   - Social sharing generates platform-specific content

## External Dependencies

### CDN Dependencies
- **Bootstrap 5.3.0**: UI framework and responsive grid system
- **Font Awesome 6.4.0**: Icon library for enhanced visual elements
- **Google Fonts**: Noto Sans KR for proper Korean text rendering

### API Integrations
- **Kakao JavaScript SDK**: Social sharing for Korean market
- **Google AdSense**: Display advertising for monetization

### Environment Variables
- `KAKAO_APP_KEY`: Kakao API key for social sharing
- `GOOGLE_ADSENSE_CLIENT`: Google AdSense publisher ID
- `GOOGLE_ADSENSE_SLOT`: Ad slot identifier

## Deployment Strategy

### Static Site Hosting
- **Recommended Platforms**: Netlify, Vercel, GitHub Pages, or any static hosting
- **Build Process**: No build step required - direct deployment of source files
- **Environment Configuration**: Configure API keys through hosting platform environment variables

### Performance Considerations
- **Asset Optimization**: Minify CSS/JS for production
- **CDN Usage**: Leverage CDN for external dependencies
- **Caching Strategy**: Implement proper cache headers for static assets

### SEO Optimization
- **Meta Tags**: Comprehensive Open Graph and Twitter Card meta tags
- **Semantic HTML**: Proper heading hierarchy and semantic markup
- **Multilingual SEO**: Separate meta tags for different languages

## Changelog

```
Changelog:
- July 01, 2025. Initial setup
- July 01, 2025. Enhanced UI/UX and added navigation features:
  * Added previous button functionality in quiz
  * Implemented result sharing with custom URLs
  * Enhanced visual design with gradients, animations, and hover effects
  * Added link copying functionality
  * Improved mobile responsiveness
  * Fixed console errors (process undefined, service worker 404)
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```

## Architecture Decisions

### 1. Vanilla JavaScript Over Framework
- **Problem**: Need for lightweight, fast-loading application
- **Solution**: Pure JavaScript with class-based organization
- **Rationale**: Reduces bundle size, improves loading speed, eliminates framework dependencies
- **Trade-offs**: More manual DOM manipulation, but better performance for simple applications

### 2. JSON-based Data Management
- **Problem**: Need for structured data storage without backend
- **Solution**: Separate JSON files for questions, results, and translations
- **Rationale**: Easy to maintain, allows for easy localization, enables content updates without code changes
- **Trade-offs**: Requires multiple HTTP requests, but enables better content management

### 3. CSS Custom Properties for Theming
- **Problem**: Need for dynamic theme switching
- **Solution**: CSS custom properties with JavaScript theme toggling
- **Rationale**: Native CSS solution, better performance than JavaScript-based styling
- **Trade-offs**: Limited browser support in older browsers, but provides modern theming solution

### 4. Bootstrap for Responsive Design
- **Problem**: Need for mobile-first responsive layout
- **Solution**: Bootstrap 5 utility classes and grid system
- **Rationale**: Rapid development, consistent cross-browser behavior, extensive component library
- **Trade-offs**: Larger CSS bundle, but significantly faster development time