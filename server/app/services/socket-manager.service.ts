import { RoomManager } from '@app/services/room-manager.service';
import { GameSettings } from '@common/game-settings';
import { PlayerIndex } from '@common/PlayerIndex';
import { State } from '@common/room';
import * as http from 'http';
import * as io from 'socket.io';
import { Service } from 'typedi';

@Service()
export class SocketManager {
    private sio: io.Server;
    private roomManager: RoomManager;
    constructor(server: http.Server, roomManager: RoomManager) {
        this.sio = new io.Server(server, { cors: { origin: '*', methods: ['GET', 'POST'] } });
        this.roomManager = roomManager;
    }

    handleSockets(): void {
        this.sio.on('connection', (socket) => {
            socket.on('createRoom', (gameSettings: GameSettings) => {
                const roomId = this.roomManager.createRoomId(gameSettings.playersName[PlayerIndex.OWNER]);
                this.roomManager.createRoom(socket.id, roomId, gameSettings);
                socket.join(roomId);
                // give the client his roomId to communicate later with server
                socket.emit('yourRoomId', roomId);
                // room creation alerts all clients on the new rooms configurations
                this.sio.emit('roomConfiguration', this.roomManager.rooms);
            });

            socket.on('getRoomsConfiguration', () => {
                // getRoomsConfigurations only alerts the asker about the rooms configurations
                socket.emit('roomConfiguration', this.roomManager.rooms);
            });

            socket.on('newRoomCustomer', (playerName: string, roomId: string) => {
                if (this.roomManager.isNotAvailable(roomId)) {
                    // block someone else entry from dialog window
                    socket.emit('roomAlreadyToken');
                    return;
                }
                this.roomManager.addCustomer(playerName, roomId);
                // Search the good room and set the custommer ID
                const myroom = this.roomManager.find(roomId);
                // On s'assure de pas avoir une room indéfinie
                if (myroom !== undefined) {
                    this.roomManager.setSocket(myroom);
                }
                this.roomManager.setState(roomId, State.Playing);
                // block someone else entry from room selection
                this.sio.emit('roomConfiguration', this.roomManager.rooms);
                socket.join(roomId);
                // update roomID in the new filled room to allow the clients in this room
                // to ask the server make some actions in their room later
                this.sio.in(roomId).emit('yourRoomId', roomId);
                // send back to the joiner his game settings with his starting status
                // and his name display position
                socket.emit('yourGameSettings', this.roomManager.formatGameSettingsForCustomerIn(roomId));
                // send back to the creator his game settings with his starting status
                // and his name display position
                socket.to(roomId).emit('yourGameSettings', this.roomManager.getGameSettings(roomId));
                // redirect the clients in the new filled room to game view
                this.sio.in(roomId).emit('goToGameView');
            });

            socket.on('sendPlacement', (scrabbleBoard: string[][], startPosition: unknown, orientation: string, word: string, roomId: string) => {
                socket.to(roomId).emit('receivePlacement', scrabbleBoard, startPosition, orientation, word);
            });

            socket.on('deleteGame', (roomId: string) => {
                this.roomManager.deleteRoom(roomId);
                this.sio.emit('roomConfiguration', this.roomManager.rooms);
                socket.disconnect();
            });

            socket.on('disconnect', () => {
                const roomId = this.roomManager.findRoomIdOf(socket.id);
                this.roomManager.deleteRoom(roomId);
                this.sio.emit('roomConfiguration', this.roomManager.rooms);
                this.sio.in(roomId).emit('goToMainMenu');
                socket.disconnect();
                // route les joueurs vers le debut avec un message d'erreur
            });

            socket.on('sendReserve', (reserve: unknown, reserveSize: number, roomId: string) => {
                socket.to(roomId).emit('receiveReserve', reserve, reserveSize);
            });

            socket.on('sendRoomMessage', (message: string, roomId: string) => {
                socket.to(roomId).emit('receiveRoomMessage', message);
            });

            socket.on('switchTurn', (turn: boolean, roomId: string) => {
                if (turn) {
                    socket.to(roomId).emit('turnSwitched', turn);
                    this.sio.in(roomId).emit('startTimer');
                    // console.log('time');
                }
            });

            socket.on('updateScoreInfo', (score: number, indexPlayer: number, roomId: string) => {
                socket.to(roomId).emit('receiveScoreInfo', score, indexPlayer);
            });

            socket.on('sendActions', (actions: string[], roomId: string) => {
                socket.to(roomId).emit('receiveActions', actions);
            });

            socket.on('sendEndGame', (isEndGame: boolean, roomId: string) => {
                this.sio.in(roomId).emit('receiveEndGame', isEndGame);
            });

            socket.on('sendPlayerTwo', (letterTable: unknown, roomId: string) => {
                socket.to(roomId).emit('receivePlayerTwo', letterTable);
            });
        });
    }
}
