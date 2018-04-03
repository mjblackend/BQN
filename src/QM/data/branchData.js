//The settings inside the BD and not from the server

class branchData {
    constructor() {
        this.countersData = {};
        this.userData = {};
        this.visitData = {};
        this.userActivitiesData = {};
        this.transaction = {};
        this.settings = {}; //If there is a settings save on db
    }
}
module.exports = branchData;