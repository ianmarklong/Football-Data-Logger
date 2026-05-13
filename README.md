
# Football Data Logger

A simple web app to help log football pass data while watching a match

## What it does

- Logs passer, receiver, match time, completion status and additional details
- Pop-up message when log fails
- Allows buttons to show names or numbers
- Allows player numbers, names, and positions to be edited
- Stores events locally before export
- Exports logged data to a Google Sheet worksheet named `Passes`

## Tech Stack

- HTML
- CSS
- JavaScript
- Python Flask
- Google Sheets API
- Render deployment

## Why I built this

I built this project for my former coach to help him and his players track their passing data from their matches faster.
This also was to practise vanila JavaScript, specifically, DOM manipulation, state management, event handling, responsive layout, Flask routing, and API integration.

## Key Learning Points

- Managing frontend state without a framework
- Structuring event data for export
- Handling substitutions by saving player snapshots per event instead of referring to a player information list
- Connecting a frontend app to a Flask backend
- Deploying a full-stack app with environment variables
- Familiarity with modern CSS layout tools
- Experience with virtual environments
- Usage of git and github 


## How to Use

1. Edit player information if applicable
2. Start the timer or press Spacebar
3. Select passer and receiver
4. Add pass details if needed
5. Press Log
6. After logging events, paste a Google Sheet link
7. Ensure Google Sheet allows anyone to edit
8. Export data to the `Passes` worksheet
   

## Live Demo

[https://iqboy-pass-logger-tool.onrender.com/]

## Screenshots

### Main Interface
![Main UI 1](static/screenshots/main-ui1-2.png)
![Main UI 2](static/screenshots/main-ui2.png)
### With Events Logged
![Main UI 3](static/screenshots/main-ui3.png)
### When Log is Invalid
![Main UI 4](static/screenshots/main-ui4.png)

### Player Edit View
![Edit Mode](static/screenshots/edit-mode.png)

### Google Sheet Output
![Google Sheet](static/screenshots/google-sheet.png)
Can do your own formatting on google sheets to make it more presentable.

