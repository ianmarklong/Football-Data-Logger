import gspread #for google sheets API
from gspread_formatting import * #for formatting google sheets
from google.oauth2.service_account import Credentials #for authentication with Google Sheets API
from flask import Flask, request, jsonify, render_template
from flask_cors import CORS #to allow cross-origin requests from frontend
import os
import json

app = Flask(__name__)
CORS(app) #to solve CORS issues when frontend and backend are on different ports during development

@app.route("/")
def home():
    return render_template("index.html")

#Helper functions

def find_player_by_number(players, number):
    for player in players.values():
        if player['number'] == number:
            return player
    return None

def get_sheet(sheet_url):
    scopes = ["https://www.googleapis.com/auth/spreadsheets"] 

    creds_json = os.environ.get("GOOGLE_CREDENTIALS_JSON")

    creds_dict = json.loads(creds_json)

    creds = Credentials.from_service_account_info(
        creds_dict, scopes=scopes
    )

    client = gspread.authorize(creds) #creates client to interact with Google Sheets API using the provided credentials and scopes

    spreadsheet = client.open_by_url(sheet_url)

    try: #tries to open a worksheet called 'Passes' in the google sheet link 
        worksheet = spreadsheet.worksheet("Passes")
    except: #if not found, creates a new worksheet with that name and adds formatting
        worksheet = spreadsheet.add_worksheet(title="Passes", rows="1000", cols="20")
        worksheet.append_row([
            'Match clock','Pass from','Pos(from)','Pass recipient','Pos(to)',
            'Pass complete/incomplete','Comments','Long ball',
            'If long ball is incomplete:','Open Play'
        ])
        ##formatting##
            # Set header row formatting (bold)
        format_cell_range(
            worksheet,
            'A1:J1',
            CellFormat(
                textFormat=TextFormat(bold=True)
            )
        )
            # Freeze header row
        set_frozen(worksheet, rows=1)

            #add filtering to header row
        worksheet.set_basic_filter('A1:J1') ######

            # Set column widths for better readability
        set_column_widths(worksheet, [
            ('A', 90),   # time
            ('B', 140),  # passer
            ('C', 90),   # pos
            ('D', 140),  # receiver
            ('E', 90),   # pos
            ('F', 160),  # complete
            ('G', 140),  # comments
            ('H', 110),  # long ball
            ('I', 180),  # incomplete detail
            ('J', 110),  # open play
        ])

    return worksheet


@app.route('/export', methods = ['POST'])
def export():
    data = request.json
    events = data.get('events', [])
    players = data.get('players', {})
    sheet_url = data.get('sheetUrl')

    if not events:
        print('No events to export')
        return jsonify({"error": "No events to export"}), 400
    if not players:
        print('No player mapping provided')
        return jsonify({"error": "Player mapping is required"}), 400   
    if not sheet_url:
        print('No Google Sheet URL provided')
        return jsonify({"error": "Google Sheet URL is required"}), 400
    
    worksheet = get_sheet(sheet_url)

    print('Received exports: ')
    print('events:', events)
    print('players:',players)
    print('sheet_url:', sheet_url)
    print()
    rows = []
    
    for event in events:
        passerObject = find_player_by_number(players, event['passer'])
        if not passerObject:
            print('Passer not found for event:', event)
            continue  # Skip if player not found
        passerName = passerObject['name']
        passerPosition = passerObject['position']

        receiverObject = find_player_by_number(players, event['receiver'])
        if not receiverObject:
            print('Receiver not found for event:', event)
            continue  # Skip if player not found
        receiverName = receiverObject['name']
        receiverPosition = receiverObject['position']

        completed = 'Complete' if event['completed'] else 'Incomplete'

        comment = event['comment'] if event['comment'] else '-'

        if 'Long ball' in event['longBall']:
            longBall = 'Yes'
        else:
            longBall = '-'
        
        if len(event['longBall']) > 10:
            longBallIncomplete = event['longBall'][10:].strip()
        else:
            longBallIncomplete = None
        
        openPlay = 'Yes'
        setPieces = ['Throw-in','Corner','Free kick','Kickoff','Goal kick']
        if event['comment'] in setPieces:
            openPlay = 'No'
        
        row = [event['time'],passerName,passerPosition,receiverName,receiverPosition,completed,comment,longBall,longBallIncomplete,openPlay] 
        rows.append(row)
    
    
    worksheet.append_rows(rows, value_input_option='USER_ENTERED') #with user-entered formatting (so that things like dates and dropdowns work correctly)
        

    return jsonify({"status": 'export received'})



if __name__ == "__main__":
    print("starting flask")
    app.run(debug=True)