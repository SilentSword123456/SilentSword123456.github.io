# How to Edit Content

This site is now modular and easy to edit! Here's how to add or modify content:

## Adding a New Project

1. Open `sections/projects.json`
2. Add a new project object to the `projects` array:

```json
{
  "name": "Your Project Name",
  "description": "Description of your project",
  "technologies": ["Tech1", "Tech2", "Tech3"],
  "status": "🚀 Status"
}
```

## Adding a New Skill

1. Open `sections/skills.json`
2. Add a new skill object to the `skills` array:

```json
{
  "name": "New Language",
  "icon": "NL",
  "level": 75
}
```

## Adding a New Section

1. Create a new `.json` file in the `sections/` directory
2. Follow this structure:

```json
{
  "id": "section-name",
  "command": "./section-name",
  "title": "$ your-command",
  "content": {
    // Your content here
  }
}
```

3. The site will automatically detect and add it to the navigation!

## Modifying Existing Content

- **About section**: Edit `sections/about.json`
- **Skills**: Edit `sections/skills.json`
- **Projects**: Edit `sections/projects.json`
- **Collaborate**: Edit `sections/collaborate.json`

All changes are automatically loaded when you refresh the page!