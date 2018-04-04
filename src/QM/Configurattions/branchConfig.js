class branchConfig {
    constructor() {
        this.ID;
        this.OrgID;
        this.Identity;
        this.Settings = {}; //array of settings from the config and common config
        this.Counters = {};
        this.UsersAllocation = {};
        this.Halls = {};
        this.segmentsAllocation = {};
        this.servicesAllocation = {};
        
        
    }
}

module.exports = branchConfig;

        