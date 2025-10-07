# Contributing to Real-Time Chat Application

## Getting Started

### Prerequisites
- Node.js (version 14 or above)
- MongoDB (locally or cloud-hosted)
- Git

### Setup
1. Fork the repository
2. Clone your fork: `git clone https://github.com/jmrashed/chat-backend.git`
3. Install dependencies: `npm install`
4. Copy `.env.example` to `.env` and configure your environment variables
5. Start MongoDB and run the application: `npm start`

## Development Guidelines

### Code Style
- Use ES6+ features
- Follow existing code formatting
- Use meaningful variable and function names
- Add JSDoc comments for functions and classes

### Commit Messages
- Use present tense ("Add feature" not "Added feature")
- Use imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit first line to 72 characters
- Reference issues and pull requests liberally

### Testing
- Write tests for new features
- Ensure all tests pass: `npm test`
- Maintain test coverage above 80%

## Pull Request Process

1. Create a feature branch: `git checkout -b feature/your-feature-name`
2. Make your changes and commit them
3. Push to your fork: `git push origin feature/your-feature-name`
4. Create a Pull Request with:
   - Clear description of changes
   - Reference to related issues
   - Screenshots if applicable

### PR Requirements
- All tests must pass
- Code must be properly documented
- No merge conflicts
- Approved by at least one maintainer

## Reporting Issues

Use GitHub Issues to report bugs or request features. Include:
- Clear description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Environment details (OS, Node.js version, etc.)