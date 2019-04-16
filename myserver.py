from flask import Flask, render_template, request
from flask_socketio import SocketIO, emit, join_room, send

app = Flask(__name__)
socketio = SocketIO(app)

PLAYERS = {}
PORT_NUM = 1414


# set up server
@app.route('/')
def index():
    return render_template('index.html')


# connect players
@socketio.on('connect')
def onConnect():
    # add player to game
    p_id = request.sid
    p_len = len(PLAYERS)+1
    PLAYERS[p_id] = p_len
    
    # setup payload
    payload = dict(id=p_id, p_num=p_len, p_len=p_len, stone=[0,0])

    # broadcast new user + # of connected users
    emit('player_info', payload, broadcast=True)
    emit('players_connected', p_len, broadcast=True)


# stone placement
@socketio.on('click')
def onClick(data):
    # get player_id
    p_id = request.sid
    
    # get player info
    if PLAYERS[p_id]:
        p_num = PLAYERS[p_id] 
    else:
        return

    # get coordinates
    p_stone = data.get('coordinates')

    # update payload
    payload = dict(id=p_id, p_num=p_num, p_len=len(PLAYERS), stone=p_stone)

    # broadcast the movement of the user
    emit('player_info', payload, broadcast=True)


# disconnect player
@socketio.on('disconnect')
def on_disconnect():

    # remove player
    p_id = request.sid

    # removing player from BOARD
    for key in PLAYERS.keys():
        if PLAYERS[key] > PLAYERS[p_id]:
            PLAYERS[key] = PLAYER[key]-1

    del PLAYERS[p_id]

    # let other player know who left and how many are left
    emit('player_info', dict(id=p_id, remove=True), broadcast=True)
    emit('p_connected', len(PLAYERS), broadcast=True)


if __name__ == '__main__':
    socketio.run(app, debug=True, port=PORT_NUM)