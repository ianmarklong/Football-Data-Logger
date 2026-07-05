//State Variables//
let matchSeconds = 0;
let isRunning = false;
let intervalID = null;

let editingTime = false;

let playerDisplayNames = true; //default to showing player names on buttons instead of numbers//;
let passer = null;
let receiver = null;
let isEditingPlayers = false;

let completed = true; //default to complete pass//
let comment = '-'; //default to no comment//
let longBall = '';

let events = [];

let players = {
                1: {number: 1, name: 'Player 1', position: 'GK'},
                2: {number: 2, name: 'Player 2', position: 'RB'},
                3: {number: 3, name: 'Player 3', position: 'LB'},
                4: {number: 4, name: 'Player 4', position: 'LCB'},
                5: {number: 5, name: 'Player 5', position: 'RCB'},
                6: {number: 6, name: 'Player 6', position: 'LCM'},
                7: {number: 7, name: 'Player 7', position: 'LW'},
                8: {number: 8, name: 'Player 8', position: 'RCM'},
                9: {number: 9, name: 'Player 9', position: 'ST'},
                10: {number: 10, name: 'Player 10', position: 'AM'},
                11: {number: 11, name: 'Player 11', position: 'RW'}
            };          

let howToUseHidden = true
//DOM Elements//
const timeDisplay = document.getElementById('timerDisplay');
const timerEditInput = document.getElementById('timerEditInput');
const playPauseButton = document.getElementById('playPause');
const playIcon = document.getElementById('playIcon');
const pauseIcon = document.getElementById('pauseIcon');
const resetButton = document.getElementById('timerReset');
const minus5Button = document.getElementById('minus5');
const plus5Button = document.getElementById('plus5');
const minus3Button = document.getElementById('minus3');
const plus3Button = document.getElementById('plus3');

const toggleDisplayButton = document.getElementById('toggleDisplayButton');
const passerDisplay = document.getElementById('passerDisplay');
const receiverDisplay = document.getElementById('receiverDisplay');
const playerButtons = document.querySelectorAll('.player');
const playerNumberInputs = document.querySelectorAll('.playerNumberInput');
const playerNameInputs = document.querySelectorAll('.playerNameInput');
const playerPosInputs = document.querySelectorAll('.playerPosInput');
const editPlayerButton = document.getElementById('editPlayerButton');
const cancelEditPlayerButton = document.getElementById('cancelEditPlayerButton');
const saveEditPlayerButton = document.getElementById('saveEditPlayerButton');
const editTileSpans = document.querySelectorAll('.editTile');


const completedButton = document.getElementById('completed');
const commentButtons = document.querySelectorAll('.comment');
const longballButtons = document.querySelectorAll('.longBall');

const logButton = document.getElementById('log');
const undoLastButton = document.getElementById('undoLast');
const clearLogButton = document.getElementById('clearLog');
const eventsTableBody = document.getElementById('eventsTableBody');
const exportButton = document.getElementById('export');
const feedbackDisplay = document.getElementById('feedbackDisplay')

const resetAllButton = document.getElementById('resetAll');
const howToUseButton = document.getElementById('howToUseButton')

const hideButton = document.getElementById('hideButton')
const popupOverlay = document.getElementById('popupOverlay');
const popupNotification = document.getElementById('popupNotification');
const howToUseCard = document.getElementById('howToUseCard');


// Load players from localStorage if available//
const savedPlayers = localStorage.getItem('players');

if (savedPlayers) {
    try {
        players = JSON.parse(savedPlayers);
    } catch (e) {
        console.log('Error loading players from localStorage');
    }
}
//render player buttons with loaded player numbers//
updatePlayerButtons();

// Load events from localStorage if available//
const savedEvents = localStorage.getItem('events');

if (savedEvents) {
    try {
        events = JSON.parse(savedEvents);
    } catch (e) {
        console.log('Error loading events from localStorage');
    }
}

//render events in table//
for (const event of events) {
    addEventToTable(event);
}


//Timer Section//
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
}

function startTimer() {
    if (!isRunning) {
        isRunning = true;
        intervalID = setInterval(() => {
            matchSeconds++;
            timeDisplay.textContent = formatTime(matchSeconds);
        }, 1000);
        playIcon.classList.add('hidden');
        pauseIcon.classList.remove('hidden');
        timeDisplay.classList.add('timerOn');
        }
}

function pauseTimer() {
    if (isRunning) {
        isRunning = false;
        clearInterval(intervalID);
        intervalID = null; // Clear the interval ID to prevent potential issues when restarting the timer
        playIcon.classList.remove('hidden');
        pauseIcon.classList.add('hidden');
        timeDisplay.classList.remove('timerOn');
        }
}


function resetTimer() {
    pauseTimer();
    matchSeconds = 0;
    timeDisplay.textContent = formatTime(matchSeconds);
    timeDisplay.classList.remove('timerOn');
}  

function renderTimer() {
    timeDisplay.textContent = formatTime(matchSeconds);
}

//Feedback Display Helper//
function displayFeedback(message) {
    feedbackDisplay.textContent = message;
}

function toggleTimer() {
    if (isRunning) {
        pauseTimer();
    } else {
        startTimer();
    }  
}

function adjustTime(seconds) {
    matchSeconds = Math.max(0, matchSeconds + seconds);
    timeDisplay.textContent = formatTime(matchSeconds);
}

playPauseButton.addEventListener('click', toggleTimer);
resetButton.addEventListener('click', resetTimer);
minus5Button.addEventListener('click', () => adjustTime(-5));
plus5Button.addEventListener('click', () => adjustTime(5));
minus3Button.addEventListener('click', () => adjustTime(-3));
plus3Button.addEventListener('click', () => adjustTime(3));

//make timer clickable to manually input time//
timeDisplay.addEventListener('click', () => {
    if (!editingTime) {
        pauseTimer();
        editingTime = true;
        timeDisplay.classList.add('hidden'); //hides original time display// 
        timerEditInput.classList.remove('hidden'); //shows input field//
        timerEditInput.value = formatTime(matchSeconds); //puts current match time into the input field//
        timerEditInput.focus();
        timerEditInput.select();
    }
});

// Handle input formatting and validation
timerEditInput.addEventListener('input', (e) => { //runs every time user types in the input field//
    let raw = e.target.value.replace(/:/g, ''); // Remove any existing colon
    let digits = raw.replace(/\D/g, ''); // Remove non-digits
    digits = digits.slice(0, 4); // Limit to 4 digits
    if (digits.length === 4) {
        digits = digits.slice(0, 2) + ':' + digits.slice(2);
    }
    e.target.value = digits; // Updates input field // 
});

// Handle saving the edited time
timerEditInput.addEventListener('blur', () => { //blur is when the element goes out of focus or user clicks away//
    saveEditedTime();
});

timerEditInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        saveEditedTime();
    }
});

function saveEditedTime() {
    if (editingTime) {
        const inputValue = timerEditInput.value;
        const timeParts = inputValue.split(':');
        if (timeParts.length === 2) {
            const mins = parseInt(timeParts[0]) || 0;
            const secs = parseInt(timeParts[1]) || 0;
            matchSeconds = mins * 60 + secs;
        }
        editingTime = false;
        timerEditInput.classList.add('hidden');
        timeDisplay.classList.remove('hidden');
        timerEditInput.classList.remove('isEditing');
        renderTimer();
        displayFeedback('Latest Update: Timer updated');
    }
}

//Trigger play/pause when spacebar is pressed//
document.addEventListener('keydown', (e) => {
    //ensure does not trigger when user is type in the timer edit input field or editing player info to prevent unintended timer toggling//
    if (e.code === 'Space' && !editingTime && !isEditingPlayers) {
        e.preventDefault(); //prevents default spacebar action of scrolling down the page//
        toggleTimer();
    }
})

//Player Section//
toggleDisplayButton.addEventListener('click', () => {
    playerDisplayNames = !playerDisplayNames;
    if (playerDisplayNames) {
        toggleDisplayButton.textContent = 'Show Numbers';
    } 
    else {
        toggleDisplayButton.textContent = 'Show Names';
    }
    updatePlayerButtons();
});
function updatePlayerDisplay() {
    console.log('Updating player display: Passer:', passer, 'Receiver:', receiver);
    if (passer !== null) {
    passerDisplay.textContent = `Passer: (#${players[passer.slice(6)].number})`;
    } else {
        passerDisplay.textContent = 'Passer: None';
    }
    if (receiver !== null) {
    receiverDisplay.textContent =`Receiver: (#${players[receiver.slice(6)].number})`
    } else {
        receiverDisplay.textContent = 'Receiver: None';
    }
    

}
playerButtons.forEach((playerButton) => {
    playerButton.addEventListener('click', () => {
        if (playerButton.id === passer) {
            passer = null;
            playerButton.classList.remove('selectedPasser');
        }
        else if (playerButton.id === receiver) {
            receiver = null;
            playerButton.classList.remove('selectedReceiver');
        }
        else if (!passer) {
            passer = playerButton.id;
            playerButton.classList.add('selectedPasser');
        }
        else if (!receiver) {
            receiver = playerButton.id;
            playerButton.classList.add('selectedReceiver');
        }
        else {
            //If passer and receivers are already selected do nothing//
            console.log('Passer and Receiver already selected');
            //stop event from toggling passer/receiver if both are already selected to prevent confusion//
            return;
        }
        updatePlayerDisplay();
    });
});

//Toggle Edit Player Mode On by pressing the edit button//
editPlayerButton.addEventListener('click', () => {
    isEditingPlayers = true;
    //populate input fields with current player numbers and names from players object//
    playerNumberInputs.forEach((input, index) => {
        const playerKey = index + 1; //player keys are 1-11, input indexes are 0-10//
        input.value = players[playerKey].number;
    });
    playerNameInputs.forEach((input, index) => {
        const playerKey = index + 1;
        input.value = players[playerKey].name;
    });
    playerPosInputs.forEach((input, index) => {
        const playerKey = index + 1;
        input.value = players[playerKey].position;
    });
    toggleEditPlayerMode();
});

cancelEditPlayerButton.addEventListener('click', () => {
    isEditingPlayers = false;
    toggleEditPlayerMode();
});

saveEditPlayerButton.addEventListener('click', () => {
    //save changes to players object//
    
    //fully validate inputs before saving any changes to prevent partial updates in case of invalid input//
    let isValid = true;
    let errorMessage = '';

    playerNumberInputs.forEach((input, index) => {
        //console.log('input value:', input.value, 'index:', index);//
        //convert input value to number for validation//
        const inputValue = Number(input.value);
        //add validation to ensure input is a number between 1 and 99//
        if (isNaN(inputValue) || inputValue < 1 || inputValue > 99) {
            console.log('Invalid input for player number:', input.value);
            errorMessage = 'Invalid player number (must be 1-99)';
            isValid = false;
        }
        else {
            //check for duplicate player numbers//
            for (let i = 0; i < playerNumberInputs.length; i++) {
                if (i !== index && Number(playerNumberInputs[i].value) === inputValue) { //i !== index to skip itself//
                    console.log('Duplicate player number found:', inputValue);
                    errorMessage = `Duplicate player number: ${inputValue}`;
                    isValid = false;
                }
            }
        }        
    });
    playerNameInputs.forEach((input, index) => {
        //console.log('input value:', input.value, 'index:', index);//
        //add validation to ensure name is not too long//
        if (input.value.trim().length > 15) {
            console.log('Invalid length for player name:', input.value);
            errorMessage = 'Player name too long (max 15 characters)';
            isValid = false;
        } 
    });
    playerPosInputs.forEach((input, index) => {
        //console.log('position input value:', input.value, 'index:', index);
        const positionValue = input.value.trim();
        if (positionValue.length === 0 || positionValue.length > 10) {
            console.log('Invalid player position:', input.value);
            errorMessage = 'Invalid position (max 10 characters)';
            isValid = false;
        }
    });

    if (!isValid) {
        console.log('Validation failed. Changes not saved.');
        displayFeedback('Latest Update: '+errorMessage);
    }
    else {        
        console.log('Validation passed. Saving changes.');
        playerNumberInputs.forEach((input, index) => {
            const playerKey = index + 1;
            players[playerKey].number = Number(input.value);
        });
        playerNameInputs.forEach((input, index) => {
            const playerKey = index + 1;
            players[playerKey].name = input.value.trim();
        });
        playerPosInputs.forEach((input, index) => {
            const playerKey = index + 1;
            players[playerKey].position = input.value.trim();
        });
        displayFeedback('Latest Update: Player information updated successfully');
    }
    console.log('Updated players:', players);
    isEditingPlayers = false;
    toggleEditPlayerMode();
    updatePlayerButtons();
    try {
        localStorage.setItem('players', JSON.stringify(players)); //save updated players to localStorage//
    } catch (e) {
        console.error('Error saving players to localStorage:', e);
        displayFeedback('Latest Update: Could not save player data locally');
    }
});


function toggleEditPlayerMode() {
    if (isEditingPlayers) {
        //hide edit and player select buttons, unhide input fields and save/cancel buttons//
        editPlayerButton.classList.add('hidden');
        playerButtons.forEach(btn => btn.classList.add('hidden'));

        cancelEditPlayerButton.classList.remove('hidden');
        saveEditPlayerButton.classList.remove('hidden');
        editTileSpans.forEach(span => span.classList.remove('hidden'));
    }
    else {
        //hide input fields and save/cancel buttons, unhide edit and player select buttons//
        cancelEditPlayerButton.classList.add('hidden');
        saveEditPlayerButton.classList.add('hidden');
        editTileSpans.forEach(span => span.classList.add('hidden'));

        editPlayerButton.classList.remove('hidden');
        playerButtons.forEach(btn => btn.classList.remove('hidden'));
    }
}

//function to update player buttons with new numbers and names after editing//
function updatePlayerButtons() {
    playerButtons.forEach((button, index) => {
        const playerKey = index + 1;

        if (playerDisplayNames) {
            button.textContent = `${players[playerKey].name}`;
        }
        else {
            button.textContent = `${players[playerKey].number}`;
        }
    });
}


//Details Section//

//Completed Button//
completedButton.addEventListener('click', () => {
    completed = !completed; //flips from completed to incomplete and vice versa//
    console.log('Completed set to:', completed);
    if (completed) {
        //change button text to 'Completed'
        completedButton.textContent = 'Completed';

        completedButton.classList.remove('incompletePass'); //removes red button color to indicate state//
        completedButton.classList.add('completedPass'); //adds green button color to indicate state//
    } else {
        completedButton.textContent = 'Incomplete';

        completedButton.classList.remove('completedPass'); //removes green button color to indicate state//
        completedButton.classList.add('incompletePass'); //adds red button color to indicate state//
    }
});

//Comment Buttons//
commentButtons.forEach((button) => {
    button.addEventListener('click', () => {
        if (comment === button.dataset.comment) {
            comment = '-'; //toggle back to default comment if same button is clicked again//
            button.classList.remove('selectedComment');
        } else {
            comment = button.dataset.comment;
            commentButtons.forEach((btn) => btn.classList.remove('selectedComment'));//for larger scale, should optimize by only removing from previously selected button by referring to state variable instead of iterating through all buttons//
            button.classList.add('selectedComment');
        }
        console.log('Comment set to:', comment);
    }
)});

//Long Ball Buttons//
longballButtons.forEach((button) => {
    button.addEventListener('click', () => {
        if (longBall === (button.dataset.longball)) {
            longBall = '';
            button.classList.remove('selectedLongBall');
            console.log('Long Ball unset');
        } else {
            longBall = button.dataset.longball;
            longballButtons.forEach((btn) => btn.classList.remove('selectedLongBall'));//for larger scale, should optimize by only removing from previously selected button by referring to state variable instead of iterating through all buttons//
            button.classList.add('selectedLongBall');
            console.log('Long Ball set to:', longBall);
        }
    });
});

//Log Event Button//
logButton.addEventListener('click', () => {
    if (passer === null || receiver === null) {
        showPopup();
        displayFeedback('Latest Update: Please select both passer and receiver');
        return;
    }
    // Proceed with logging the event
    console.log('Logging event with Time:', formatTime(matchSeconds), 'Passer:', passer, 'Receiver:', receiver, 'Completed:', completed, 'Comment:', comment, 'Long Ball:', longBall);
    const passerKey = passer.slice(6); // Extract player key from button ID (e.g., 'player3' -> '3')
    const receiverKey = receiver.slice(6);
    const event = {
        time: formatTime(matchSeconds),

        passer: players[passerKey].number,
        passerName: players[passerKey].name,
        passerPosition: players[passerKey].position,

        receiver: players[receiverKey].number,
        receiverName: players[receiverKey].name,
        receiverPosition: players[receiverKey].position,

        completed: completed,
        comment: comment,
        longBall: longBall
    };
    events.push(event);
    console.log('Current events:', events);
    addEventToTable(event);

    // Save events to localStorage after logging a new event
    try {
        localStorage.setItem('events', JSON.stringify(events));
    } catch (e) {
        console.error('Error saving events to localStorage:', e);
        displayFeedback('Latest Update: Could not save event data locally');
    }

    // After logging event, reset selections
    passer = null    
    receiver = null;
    completed = true;
    comment = '-';
    longBall = '';
    updatePlayerDisplay();
    // Reset button states
    playerButtons.forEach((btn) => {
        btn.classList.remove('selectedPasser');
        btn.classList.remove('selectedReceiver');
    });

    completedButton.textContent = 'Completed';
    completedButton.classList.remove('incompletePass');
    completedButton.classList.add('completedPass');
    commentButtons.forEach((btn) => btn.classList.remove('selectedComment'));
    longballButtons.forEach((btn) => btn.classList.remove('selectedLongBall'));

    displayFeedback('Latest Update: Event logged successfully');
});

undoLastButton.addEventListener('click',() => {
    //remove last event from events array and update table//
    if (events.length === 0) {
        displayFeedback('Latest Update: No events to undo');
        return;
    }
    events.pop();

    //re-render table after removing last event//
    eventsTableBody.innerHTML = '';
    events.forEach(addEventToTable);

    //update localStorage after undoing last event
    try {
        localStorage.setItem('events', JSON.stringify(events));
    } catch (e) {
        console.error('Error updating localStorage:', e);
    }
    
    displayFeedback('Latest Update: Event removed');
});


function addEventToTable(event) {
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${event.time}</td>
        <td>${event.passer}</td>
        <td>${event.receiver}</td>
        <td>${event.completed ? 'C' : 'I'}</td>
        <td>${event.comment}</td>
        <td>${event.longBall}</td>
    `;
    eventsTableBody.prepend(row);
}

//Clear Log Button//
clearLogButton.addEventListener('click', () => {
    if (confirm('Are you sure you want to clear the log? This cannot be undone.')) {
        events = [];
        try {
            localStorage.removeItem('events');
        } catch (e) {
            console.error('Error clearing events from localStorage:', e);
        }
        // Clear the events table
        eventsTableBody.innerHTML = '';
        displayFeedback('Latest Update: Log cleared successfully');
    }
});

//Export Section//
exportButton.addEventListener('click', () => {
    const sheetUrl = document.getElementById('googleSheetLink').value.trim();
    
    // Validate Google Sheet URL
    if (!sheetUrl) {
        displayFeedback('Latest Update: Please enter a Google Sheet URL');
        return;
    }
    
    if (!sheetUrl.includes('docs.google.com') || !sheetUrl.includes('spreadsheets')) {
        displayFeedback('Latest Update: Invalid Google Sheet URL');
        return;
    }
    
    displayFeedback('Latest Update: Exporting data...');
    //Give the data to the python backend//
    const API_BASE =
    window.location.port === '5500'
        ? 'http://127.0.0.1:5000'
        : '';

    fetch(`${API_BASE}/export`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            events: events,   // your logged events
            sheetUrl: sheetUrl // the Google Sheet URL from the input field
        })
    })
    .then(async (res) => {
        let data = null;
        try {
            data = await res.json();
        } catch (e) {
            data = null;
        }

        if (!res.ok) {
            throw new Error(data?.error || `Request failed with status ${res.status}`);
        }

        return data;
    })
    .then(data => {
        console.log('Export response:', data);
        displayFeedback('Latest Update: Export successful!');
    })
    .catch(err => {
        console.error(err);
        displayFeedback('Latest Update: Export failed: ' + err.message);
    });
});


//Reset All Data Button//
resetAllButton.addEventListener('click', () => {
    if (confirm('Are you sure you want to reset all data? This cannot be undone.')) {
        console.log('Resetting all data');
        // Reset state variables
        resetTimer();
        passer = null;
        receiver = null;
        isEditingPlayers = false;
        toggleEditPlayerMode(); // Ensure we exit edit player mode if active

        completed = true;
        comment = '-';
        longBall = '';

        events = [];
        try {
            localStorage.removeItem('events');
        } catch (e) {
            console.error('Error clearing events from localStorage:', e);
        }
        // Clear the events table
        eventsTableBody.innerHTML = '';

        // Reset players to default
        players = {
            1: {number: 1, name: 'Player 1', position: 'GK'},
            2: {number: 2, name: 'Player 2', position: 'RB'},
            3: {number: 3, name: 'Player 3', position: 'LB'},
            4: {number: 4, name: 'Player 4', position: 'LCB'},
            5: {number: 5, name: 'Player 5', position: 'RCB'},
            6: {number: 6, name: 'Player 6', position: 'LCM'},
            7: {number: 7, name: 'Player 7', position: 'LW'},
            8: {number: 8, name: 'Player 8', position: 'RCM'},
            9: {number: 9, name: 'Player 9', position: 'ST'},
            10: {number: 10, name: 'Player 10', position: 'AM'},
            11: {number: 11, name: 'Player 11', position: 'RW'}
        };
        try {
            localStorage.removeItem('players');
        } catch (e) {
            console.error('Error clearing players from localStorage:', e);
        }
        updatePlayerButtons();
        updatePlayerDisplay();
        //reset player button states//
        playerButtons.forEach((btn) => {
            btn.classList.remove('selectedPasser');
            btn.classList.remove('selectedReceiver');
        });
        //reset completed, comment, and long ball button states//
        completedButton.textContent = 'Completed';
        completedButton.classList.remove('incompletePass');
        completedButton.classList.add('completedPass');
        commentButtons.forEach((btn) => btn.classList.remove('selectedComment'));
        longballButtons.forEach((btn) => btn.classList.remove('selectedLongBall'));

        //log final state after reset to confirm//
        console.log('Final state after reset:');
        console.log('Match Seconds:', matchSeconds);
        console.log('Passer:', passer);
        console.log('Receiver:', receiver);
        console.log('Completed:', completed);
        console.log('Comment:', comment);
        console.log('Long Ball:', longBall);
        console.log('Events:', events);
        console.log('Players:', players);
        
        displayFeedback('Latest Update: All data reset to defaults');
    }
});

howToUseButton.addEventListener('click', () => {
    if(howToUseHidden){
        howToUseHidden = false
        howToUseCard.classList.remove('hidden');

        howToUseCard.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
    else{
        howToUseHidden = true
        passerDisplay.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
        setTimeout(()=>{
            howToUseCard.classList.add('hidden');
        },300)
    }
    
});


hideButton.addEventListener('click', () => {
    howToUseHidden = true
    passerDisplay.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
    setTimeout(()=>{
        howToUseCard.classList.add('hidden');
    },300)
    
});

closePopupButton.addEventListener('click', hidePopup);
let popupTimeout; // Declare popupTimeout in a scope accessible to both showPopup and hidePopup

function showPopup() {
    popupOverlay.classList.remove('hidden');
    popupNotification.classList.remove('hidden');

    let popupTimeout = setTimeout(() => {
        popupOverlay.classList.add('hidden');
        popupNotification.classList.add('hidden');
    }, 1500);
}

function hidePopup() {
    popupOverlay.classList.add('hidden');
    popupNotification.classList.add('hidden');

    clearTimeout(popupTimeout);
}




