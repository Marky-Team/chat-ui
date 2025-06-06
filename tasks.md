# Marky Implementation Tasks

## Basic Functionality

- Create post ideas using internet (incl trends and news and research)
- Create captions from ideas
- Generate from a url (blog, webpage, etc)
  - Including scraping dynamic webpages
- Media Gen
  - Create graphic designs
    - automatically search for stock photos
    - remove background from photos
    - use brand assets (colors, fonts, logo)
    - edit with natural language
  - Create infographics
  - Create videos
  - Create ai images with ideogram
- User add api keys (BYOK)
- User can edit system prompts
- Bulk scheduling

## Next TODOs

- [ ] Add social media preview components
- [ ] Create post editor interface
- [ ] Add collapsible Notes sidebar
  - Create notes.md file for content
  - Add markdown rendering component
  - Implement collapse/expand functionality
- [ ] Add analytics dashboard
  - Engagement metrics
  - Post performance
  - Team activity
  - User activity tracking

## Social Inbox Management

- [ ] Implement unified social inbox
  - [ ] Comments management
    - Fetch comments from all connected platforms
    - Real-time comment notifications
    - Comment sentiment analysis
    - Auto-categorize comments (question, feedback, spam)
    - Batch comment actions (approve, hide, delete)
    - Comment history and thread view
  - [ ] Direct messages handling
    - Unified DM inbox across platforms
    - Real-time message notifications
    - Conversation threading
    - Message status tracking (read, replied)
    - Quick reply templates
    - Automated response suggestions
  - [ ] Response management
    - AI-assisted response generation
    - Response tone and style customization
    - Response templates library
    - Response approval workflow
    - Schedule delayed responses
    - Cross-platform response tracking
  - [ ] Team collaboration
    - Assign conversations to team members
    - Internal notes on conversations
    - Team member mentions
    - Shared response templates
    - Activity logs and analytics
  - [ ] Analytics and reporting
    - Response time metrics
    - Engagement statistics
    - Team performance metrics
    - Custom report generation
    - Automated weekly/monthly reports

## Prompt Engineering Tools

- [ ] Implement prompt version control system

  - [ ] Create prompt forking functionality
    - Fork system prompt to user workspace
    - Track fork lineage and relationships
    - Handle merge conflicts
  - [ ] Add diff comparison view
    - Side-by-side diff visualization
    - Highlight changes (additions, deletions, modifications)
    - Show metadata changes
  - [ ] Implement commit system
    - Capture author information
    - Require commit messages
    - Generate and store commit hashes
    - Track commit history
  - [ ] Add prompt version selector
    - Switch between latest version and specific commits
    - Preview prompt content before selection
    - Show commit metadata
  - [ ] Implement fork synchronization
    - Detect upstream changes
    - Show diff comparison with current fork
    - Allow selective change acceptance
    - Auto-merge non-conflicting changes
    - Create commit for accepted changes

- [ ] Create interactive prompt builder

  - [ ] Variable management system
    - Fetch available variables from API
    - Store variable metadata and descriptions
    - Cache example usage from dataset
  - [ ] Implement drag-and-drop interface
    - Variable sidebar with search/filter
    - Drag targets in prompt editor
    - Syntax highlighting for variables
    - Variable tooltips with descriptions and examples
  - [ ] Add dataset integration
    - Fetch example datasets from backend API
    - Allow dataset filtering and sampling
    - Cache dataset locally for quick testing
  - [ ] Create prompt testing interface
    - Run single prompt against dataset
    - Run A/B comparison of two prompts
    - Show side-by-side output comparison
    - Calculate and display metrics
    - Export test results

- [ ] Implement auto-tune system
  - [ ] Add auto-tune toggle in settings
    - Enable/disable auto-tune feature
    - Configure auto-tune sensitivity
    - Set feedback threshold for tuning
  - [ ] Create feedback collection system
    - Track user feedback on responses
    - Aggregate feedback metrics
    - Identify patterns in negative feedback
  - [ ] Implement tune-prompt integration
    - Call tune-prompt tool based on feedback
    - Generate prompt improvements
    - Show proposed changes in diff tool
  - [ ] Add review interface for auto-tuned prompts
    - Display before/after comparison
    - Highlight key changes
    - Show expected impact metrics
    - Allow accept/reject decisions
    - Auto-commit accepted changes
