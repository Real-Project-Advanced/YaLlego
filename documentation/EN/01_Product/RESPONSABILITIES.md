# Roles, Responsabilities, and Team Organization

# Introduction

LlegoYa is a project that combines web development, mobile applications, artificial intelligence, real-time geolocation, distributed databases, and agile methodologies.

Due to the system's complexity, each team member has clearly defined responsibilities over specific modules of the project.

The objectives of this document are to:

- Define team roles.
- Establish individual responsibilities.
- Delimit work areas.
- Facilitate the onboarding of new members.
- Avoid duplication of efforts.
- Guarantee the correct execution of sprints.

---

# Organizational Structure

The project organization is divided into five main areas:

## Product Management

Responsible for defining what is built, when it is built, and why it is built.

Includes:

- Product Backlog
- User Stories
- Roadmap
- Prioritization
- Sprint Planning

---

## Frontend & UX

Responsible for the entire visual experience of the platform.

Includes:

- Interfaces
- Navigation
- Responsive Design
- User Experience
- Reusable Components

---

## Backend & Data

Responsible for all business logic and data persistence.

Includes:

- APIs
- Databases
- Security
- Authentication
- Integrations

---

## Artificial Intelligence

Responsible for the system's cognitive layer.

Includes:

- Smart Chat
- Embeddings
- RAG (Retrieval-Augmented Generation)
- Agents
- Logging
- Fine-Tuning

---

## Mobility and Geolocation

Responsible for all real-time information related to locations and routes.

Includes:

- GPS
- Tracking
- Maps
- Real-time updates
- Bus synchronization

---

# Official Project Roles

## Product Owner (PO)

Responsible for maximizing the product's value.

Functions:

- Define product vision.
- Prioritize the backlog.
- Approve features.
- Manage scope.
- Validate deliverables.

---

## Scrum Master

Responsible for ensuring the correct application of Scrum.

Functions:

- Facilitate ceremonies.
- Eliminate blockers.
- Protect the team.
- Maintain organization.

---

## Frontend Developer

Responsible for building user interfaces.

---

## Backend Developer

Responsible for building APIs and business logic.

---

## AI Engineer

Responsible for the entire Artificial Intelligence layer.

---

## Mobile Developer

Responsible for mobile applications.

---

## Realtime Engineer

Responsible for geolocation and real-time synchronization.

---

# Project Members

---

# Juan Sebastián

## Role

Product Owner + Scrum Master

## Main Mission

Ensure that the team builds the right product, rather than just writing code.

He is responsible for maintaining the general vision of LlegoYa and ensuring that all modules work in a coordinated manner.

---

## Responsibilities

### Product Management

- Maintain the Product Backlog.
- Define User Stories.
- Prioritize features.
- Define the MVP scope.
- Validate deliverables.

---

### Scrum Management

- Sprint Planning.
- Sprint Review.
- Sprint Retrospective.
- Daily Scrum.
- Follow up on blockers.

---

### Document Management

Responsible for creating and maintaining:

- README
- Product Vision
- Project Overview
- Architecture Document
- Sprint Documentation
- Release Notes
- User Stories
- System diagrams

---

### Strategic Management

Make decisions related to:

- Scope.
- Priorities.
- Roadmap.
- New modules.
- Functional architecture.

---

### Success Indicators

- Updated backlog.
- Refined stories.
- Organized sprints.
- Up-to-date documentation.
- MVP delivered on time.

---

# Miguel

## Role

AI Engineer

## Main Mission

Build the brain of LlegoYa.

Miguel is responsible for making sure the Artificial Intelligence responds correctly, understands the mobility context, and evolves into a specialized transportation assistant.

---

## Responsibilities

### Smart Chat

Develop the conversational system.

It must answer questions such as:

- Which route works for me?
- Which buses are near me?
- How do I get to my destination?
- What alternatives do I have?

---

### RAG System

Build:

Question
↓
Embedding
↓
Vector Search
↓
Context
↓
Response

---

### AI Logging

Every interaction must be stored in MongoDB.

Save:

- Question.
- Context.
- Response.
- Date.
- User.

---

### Quality Control

Reduce:

- Hallucinations.
- Ambiguous responses.
- Incorrect information.

---

### Future Fine-Tuning

Prepare the data that will allow training specialized versions of the model.

---

# Daniel

## Role

Frontend Lead & UX Engineer

## Main Mission

Build a modern, intuitive, and consistent user experience.

Daniel owns the entire visual appearance of LlegoYa.

---

## Responsibilities

### Interface Design

Build and improve:

- Login.
- Registration.
- Dashboard.
- Chat.
- Favorites.
- History.
- Admin Panel.
- Driver Panel.

---

### Design System

Define:

- Colors.
- Spacing.
- Typography.
- Reusable components.

---

### User Experience

Implement:

- Toasts.
- Alerts.
- Skeletons.
- Loaders.
- Empty states.
- Error handling.

---

### Responsive Design

Guarantee proper functionality on:

- Desktop.
- Tablet.
- Mobile.

---

### Visual Authentication

Design:

- Login flows.
- Session recovery.
- Redirections.
- Protected states.

---

# Estiven

## Role

Maps Engineer

## Main Mission

Build the entire visual ecosystem for mobility.

He will be responsible for LlegoYa's main map.

---

## Responsibilities

### Main Map

Implement:

- Route visualization.
- Bus visualization.
- Markers.
- Information layers.

---

### Mapping Integration

Evaluate and implement:

- Mapbox.
- HERE Maps.
- Google Maps Platform.

---

### Operational Visualization

Show:

- Active buses.
- Active routes.
- User's current location.

---

### Optimization

Ensure the map remains smooth and fluid even with multiple active vehicles.

---

# Samuel

## Role

Realtime & Location Engineer

## Main Mission

Make the map information real.

While Estiven displays the data, Samuel is the one who generates and synchronizes it.

---

## Responsibilities

### Geolocation

Capture:

- Driver locations.
- Bus locations.

---

### Real-Time Updates

Build:

Driver
↓
GPS
↓
API
↓
Supabase
↓
Map

---

### Synchronization

Update positions every few seconds.

---

### Tracking Backend

Create APIs to:

- Update location.
- Query location.
- Query status.

---

# Tobias

## Role

Backend & Data Engineer

## Main Mission

Build the database and the core business logic of the system.

---

## Responsibilities

### Supabase

Design:

- Tables.
- Relationships.
- Indexes.
- Permissions.

---

### MongoDB

Manage:

- History.
- Logs.
- Conversations.

---

### APIs

Create:

- CRUD for routes.
- CRUD for buses.
- CRUD for drivers.

---

### Integrations

Connect:

- Frontend.
- Database.
- AI.

---

### Data Quality

Guarantee data integrity and consistency.

---

# Mobile Developer

## Role

Mobile Engineer

## Main Mission

Build the mobile experience for both users and drivers.

---

## User Application

Functions:

- Route queries.
- AI Chat.
- Favorites.
- History.

---

## Driver Application

Functions:

- Start trip.
- End trip.
- Share location.
- Report incidents.

---

## Integrations

Consume APIs developed by the Backend.

Synchronize location using Supabase Realtime.

Maintain consistency with the web application.

---

# Team Philosophy

All team members are responsible for:

- Maintaining clean code.
- Documenting changes.
- Following Git Flow.
- Participating in reviews.
- Reporting blockers.
- Meeting the Definition of Done.

The success of LlegoYa depends on the collaboration between all areas, not just individual work.
