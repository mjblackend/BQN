class apiMessage {
    constructor() {
        let now = Date.now();
        this.packetID = now;
        this.topicName = "";
        this.payload = "";
    }
}
module.exports = apiMessage;