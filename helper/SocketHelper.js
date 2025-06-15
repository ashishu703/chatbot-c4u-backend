class SocketHelper {
    agentRoom = null;
    userRoom = null;
    allRooms = [];
    constructor(rooms = []) {
        this.allRooms = rooms;
    }


    setAgentRoom(room) {
        this.agentRoom = room;
        this.allRooms.push(room);
    }

    setUserRoom(room) {
        this.userRoom = room;
        this.allRooms.push(room);
    }

    pushUserChats(chats) {
       
        this.userRoom && this.userRoom.updateConversation(chats);
    }

    pushAgentChats(chats) {
        this.agentRoom && this.agentRoom.updateConversation(chats);
    }


    pushNewMsg(message) {
        this.allRooms.forEach(room => {
            room.pushNewMsg(message);
        });
    }

    pushNewReaction(message) {
        this.allRooms.forEach(room => {
            room.pushNewReaction(message);
        });
    }

    pushUpdateDelivery(message) {
        this.allRooms.forEach(room => {
            room.pushUpdateDelivery(message);
        });
    }
}

module.exports = SocketHelper;