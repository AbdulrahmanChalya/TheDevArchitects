# GetawayHub Travel Booking Platform - Design Guidelines

## Design Approach

**Reference-Based Approach**: Drawing inspiration from Booking.com's clean, conversion-focused design with elements from Airbnb's visual appeal and modern travel platforms.

### Key Design Principles
- Trust and clarity: Clear hierarchy, readable text, obvious CTAs
- Visual storytelling: Destination imagery drives engagement
- Conversion-optimized: Streamlined search flow with minimal friction
- Breathable spacing: Generous whitespace prevents overwhelming users

## Typography

**Font Stack**: 
- Primary: 'Inter' or 'DM Sans' (via Google Fonts CDN) - modern, clean sans-serif
- Headings: 600-700 weight
- Body text: 400 weight
- Small text/labels: 500 weight

**Hierarchy**:
- Hero headline: text-5xl md:text-6xl font-bold
- Section titles: text-3xl md:text-4xl font-semibold
- Card titles: text-xl font-semibold
- Body: text-base
- Labels/metadata: text-sm font-medium

## Layout System

**Spacing Units**: Consistent use of Tailwind units 4, 6, 8, 12, 16, 20, 24 for padding/margins
- Component spacing: p-4, p-6, p-8
- Section gaps: gap-6, gap-8, gap-12
- Container padding: px-4 md:px-6 lg:px-8

**Grid System**:
- Container max-width: max-w-7xl mx-auto
- Destination cards: grid-cols-1 md:grid-cols-2 lg:grid-cols-4
- Responsive breakpoints: sm, md, lg, xl

## Core Components

### Header/Navigation
- Sticky header with logo left, navigation center, user actions right
- Height: h-16 md:h-20
- Shadow on scroll for depth
- Navigation links with subtle hover underline animation
- User menu dropdown (Login/Sign Up or Profile)

### Hero Section with Integrated Search
- Full-width hero with large destination background image (80vh height)
- Overlay gradient for text readability
- Centered content: headline + tagline + search form
- Search form: white card with rounded-2xl, shadow-xl, backdrop-blur
- Form layout: responsive grid converting from stacked (mobile) to multi-column (desktop)

### Search Form Component (Reusable)
- White container with rounded-xl, p-6 md:p-8
- Input fields grouped in grid: grid-cols-1 md:grid-cols-2 lg:grid-cols-5
- Field structure:
  - Label: text-sm font-medium, mb-2
  - Input: rounded-lg border, p-3, focus ring
  - Icons from Heroicons (location, users, calendar, dollar)
- Primary CTA button: Large, rounded-lg, full-width on mobile, w-auto on desktop
- Hover state: slight scale and shadow increase

### Destination Cards
- Card: rounded-xl, overflow-hidden, shadow-md, hover:shadow-xl transition
- Image: aspect-video, object-cover with subtle zoom on hover
- Content padding: p-4
- Structure:
  - Destination image (full-width)
  - Location name: text-lg font-semibold
  - Price badge: Positioned absolute on image, top-right, backdrop-blur, rounded-full
  - Quick info: Icons + text (flight time, activities, rating)
  - Border-t subtle divider before price

### Popular Destinations Section
- Section padding: py-20 md:py-24
- Heading centered with mb-12
- Grid of 8 destination cards (4 columns desktop, 2 tablet, 1 mobile)
- "View All Destinations" link centered below

### Footer
- Multi-column layout: grid-cols-1 md:grid-cols-2 lg:grid-cols-4
- Sections: About, Destinations, Support, Connect
- Newsletter signup with inline form
- Social media icons (Font Awesome)
- Copyright and legal links
- Padding: pt-16 pb-8

## Animations

**Minimal, purposeful animations only**:
- Card hover: transform scale-105, shadow transition (duration-300)
- Button hover: subtle brightness increase
- Search form: smooth focus ring appearance
- NO scroll-triggered animations
- NO parallax effects

## Component States

### Buttons
- Primary: High contrast, rounded-lg, px-6 py-3
- Secondary: Outlined style with border-2
- Text buttons: Underline on hover
- Disabled: Reduced opacity, cursor-not-allowed

### Form Inputs
- Default: border-2, rounded-lg
- Focus: ring-2 ring-offset-2 
- Error: border-red-500, text-red-600 message below
- Success: border-green-500 with check icon

## Images

### Hero Image
- Large, high-quality destination background image
- Dimensions: 1920x1080 minimum
- Subject: Popular travel destination (beach, city, mountains)
- Overlay: Linear gradient from transparent to semi-dark bottom
- Placement: Full-width background of hero section

### Destination Card Images
- 8 destination images needed for popular destinations
- Dimensions: 600x400 (3:2 aspect ratio)
- Subjects: Mix of beaches, cities, cultural sites, nature
- Quality: High-resolution, vibrant, professional travel photography

### Icon Library
Use **Heroicons** via CDN for all interface icons:
- Search, location pin, calendar, users, dollar sign, heart, star, airplane, bed

## Responsive Behavior

**Mobile (< 768px)**:
- Stack all search form fields vertically
- Single column destination grid
- Simplified header with hamburger menu
- Full-width buttons

**Tablet (768px - 1024px)**:
- 2-column search form
- 2-column destination grid
- Condensed navigation

**Desktop (> 1024px)**:
- Multi-column search form (5 fields + button)
- 4-column destination grid
- Full navigation visible

## Accessibility
- All interactive elements keyboard navigable
- ARIA labels on icon-only buttons
- Sufficient contrast ratios (WCAG AA minimum)
- Focus indicators visible and clear
- Semantic HTML throughout