document.write('<div class="results-container">');                       //--Container BEGIN for game resuls
document.write('<img class="choice-result" id="enemy-choice" src="Images/unknown.png" alt="Unknown">');
document.write('<hr></hr>');
document.write('<img class="choice-result" id="player-choice"  src="Images/unknown.png" alt="Unknown">');
document.write('</div>');                                               //--Container END for game resuls

document.write('<div class="choice-container">');                       //--Container BEGIN for all player choices
document.write('<button class="button-base" id="paper">Paper</button>');
document.write('<button class="button-base" id="rock">Rock</button>');
document.write('<button class="button-base" id="scissors">Scissors</button>');
document.write('</div>');                                               //--Container END

document.write('<div class="results-container">');  
document.write('<button class="button-base" id="check-choice-button">Check</button>');
document.write('<button class="button-base" id="reset-results-button">Reset results</button>');
document.write('</div>');                                               //--Container END

document.write('<div class="label" id="results-label">Wins: 0<br>Losses: 0</br>Ties: 0<br>Total rounds played: 0</br></div>');
document.write('<div class="label" id="current-results-label">Result: no data</div>');

//****************************************************************************************/
//--Outcome data etc.

const Game_Choice = //--Choice 'enum'
{
    unknown: 0,
    paper: 1,
    rock: 2,
    scissors: 3,
};

const Game_Result =
{
    win: 0,
    loss: 1,
    tie: 2,
};

class Outcome_Data
{
    constructor(winning_decision, losing_decision)
    {
        this.first_decision = winning_decision;
        this.second_decision = losing_decision;

        //  a simplification has been made to always target first decision as the winner, 
        //  therefore result_target becomes obsolete and removed
    }
}

class Outcomes
{
    #m_outcome_data;

    constructor()
    {
        this.#m_outcome_data =
            [
                //--First sent decision always define a winner, the second one defines the losing decision
                //  becomes the winning decision, if 1, the second sent parameter becomes the winning decision
                new Outcome_Data(Game_Choice.scissors, Game_Choice.paper, 0),
                new Outcome_Data(Game_Choice.paper, Game_Choice.rock, 0),
                new Outcome_Data(Game_Choice.rock, Game_Choice.scissors, 0),

                //--Only a limited number of definitions is needed to define all cases
                //  Any combination of a tie isn't included, since any result that is the same, 
                //  will always result in a tie, therefore no complex check is needed
            ];
    }

    classify_result(first, second)
    {
        //--Find outcome data index:
        let outcome_index = -1;
        for (let i = 0; i < this.#m_outcome_data.length; i++)
        {
            //--Decision definitions
            const fdd = this.#m_outcome_data[i].first_decision; 
            const sdd = this.#m_outcome_data[i].second_decision;

            //--Decision made
            const first_dm = first.get_decision();
            const second_dm = second.get_decision();

            if ((fdd == first_dm || fdd == second_dm) && (sdd == first_dm || sdd == second_dm))
            {
                outcome_index = i;

                //--'Pointers' to player objects, defined as arrays to be able to pass by reference
                let obj_ptr = [first, second];  //--index of 0 holds the winning target, index 1 the losing

                //--If get_decision doesn't match the Outcome_Data definitions, swap will occur
                //--get_decision checked in this block must match the winning decision defined in Outcome_Data, otherwise swap
                if((first_dm != this.#m_outcome_data[i].first_decision))
                {
                    this.#swap_objects(obj_ptr);
                }
                
                obj_ptr[0].add_win();
                obj_ptr[1].add_loss();  
                return;  
            }
        }

        //--If nothing has been found, an error should occur
        if (outcome_index == -1) {throw ("Error occurred! Undefined decision set found " + "-First: " + first.get_decision() + "-Second: " + second.get_decision()); }
    }

    #swap_objects(a) //--Pass by reference required to take any effect
    {
        let a0_temp = a[0];
        a[0] = a[1];
        a[1] = a0_temp;
    }
}

//****************************************************************************************/

class Player
{
    #m_type;
    #m_wins;
    #m_loss;
    #m_ties;
    #m_decision;
    #m_last_result;

    constructor()
    {
        this.#m_type = "human";
        this.reset();
    }

    reset()
    {
        this.#m_wins = 0;
        this.#m_loss = 0;
        this.#m_ties = 0;
        this.#m_decision = Game_Choice.unknown;
        this.#m_last_result = "no data";
    }

    add_win() {this.#m_wins++; this.#m_last_result = "win";}
    add_loss() {this.#m_loss++; this.#m_last_result = "loss";}
    add_tie(){this.#m_ties++; this.#m_last_result = "tie";}
    get wins(){return this.#m_wins;}
    get loss(){return this.#m_loss;}
    get ties(){return this.#m_ties;}

    is_human() { return this.#m_type == "human"; }
    is_npc() { return this.#m_type == "npc"; }
    set_mode_to_human() { this.#m_type = "human"; }
    set_mode_to_npc() { this.#m_type = "npc"; }
    decision(d)
    {
        if(d >= 4 || d <= -1){throw("Error occurred! Unknown decision set: " + d);}
        this.#m_decision = d; 
    }
    get_decision(){return this.#m_decision;}
    last_result(){return "Result: " + this.#m_last_result;}

    auto_decision() //--For auto play or NPC
    {
        this.decision(1 + Math.floor((Math.random() * 3)));
    }
}

//****************************************************************************************/

class Game_System
{
    #m_rounds_played;
    #m_outcomes;
    #m_first_player;
    #m_second_player;

    constructor()
    {
        this.#m_rounds_played = 0;
        this.#m_outcomes = new Outcomes();
        this.#m_first_player = new Player();
        this.#m_second_player = new Player();
        this.#m_second_player.set_mode_to_npc();
    }

    check(){this.#check_results(this.#m_first_player, this.#m_second_player);}
    first_player(){return this.#m_first_player;}
    second_player(){return this.#m_second_player;}
    reset_results()
    {
        this.#m_rounds_played = 0;
        this.#m_first_player.reset();
        this.#m_second_player.reset();
    }
    get_game_results()
    {
        return `Wins: ${this.#m_first_player.wins} <br>Losses: ${this.#m_first_player.loss}</br> Ties: ${this.#m_first_player.ties} <br>Total rounds played: ${this.#m_rounds_played}<br/>`;
    }

    #check_results(a, b)
    {
        this.#m_rounds_played++;
        if(a.is_npc()){a.auto_decision();}
        if(b.is_npc()){b.auto_decision();}

        if (a.get_decision() == b.get_decision()) //--Check for a tie before complex check
        {
            a.add_tie();
            b.add_tie();
            return;
        }
        this.#m_outcomes.classify_result(a, b);
    }
}

let gsys = new Game_System();
const client_player = gsys.first_player();
const enemy_player = gsys.second_player();

//****************************************************************************************/
//--Events

//--paper button
document.getElementById('paper').addEventListener("click", fc =>
{
    client_player.decision(Game_Choice.paper);
    document.getElementById('player-choice').outerHTML = '<img class="choice-result" id="player-choice" src="Images/paper.png" alt="Paper">';
    console.log('paper button clicked');  
})

//--rock button
document.getElementById('rock').addEventListener("click", fc => 
{
    client_player.decision(Game_Choice.rock);
    document.getElementById('player-choice').outerHTML = '<img class="choice-result" id="player-choice" src="Images/rock.png" alt="Rock">';
    console.log('rock button clicked');  
})

//--scissors button
document.getElementById('scissors').addEventListener("click", fc => 
{
    client_player.decision(Game_Choice.scissors);
    document.getElementById('player-choice').outerHTML = '<img class="choice-result" id="player-choice" src="Images/scissors.png" alt="Scissors">';
    console.log('scissors button clicked');  
})

//--check-choice-button
document.getElementById('check-choice-button').addEventListener("click", fc => 
{
    if(client_player.get_decision() == Game_Choice.unknown)
    {
        alert("No decision selected, please choose one.");
        return;
    }
    gsys.check();

    switch(enemy_player.get_decision())
    {
        case Game_Choice.paper:
            document.getElementById('enemy-choice').outerHTML = '<img class="choice-result" id="enemy-choice" src="Images/paper.png" alt="paper">';
            break;

        case Game_Choice.rock:
            document.getElementById('enemy-choice').outerHTML = '<img class="choice-result" id="enemy-choice" src="Images/rock.png" alt="rock">';
            break;

        case Game_Choice.scissors:
            document.getElementById('enemy-choice').outerHTML = '<img class="choice-result" id="enemy-choice" src="Images/scissors.png" alt="Scissors">';
            break;
    }
    document.getElementById('results-label').innerHTML = gsys.get_game_results();
    document.getElementById('current-results-label').innerHTML = client_player.last_result(); 
    console.log('check-choice-button clicked');  
})

//--reset-results-button
document.getElementById('reset-results-button').addEventListener("click", fc => 
{
    gsys.reset_results();
    document.getElementById('results-label').innerHTML = gsys.get_game_results();
    document.getElementById('current-results-label').innerHTML = client_player.last_result();  
    document.getElementById('enemy-choice').outerHTML = '<img class="choice-result" id="enemy-choice" src="Images/unknown.png" alt="Unknown">'; 
    document.getElementById('player-choice').outerHTML = '<img class="choice-result" id="player-choice" src="Images/unknown.png" alt="Unknown">';
    console.log('reset-results-button clicked');
})

//****************************************************************************************/
