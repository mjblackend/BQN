class branchConfig {
    constructor() {
        this.id;
        this.org_ID;
        this.identity;
        this.settings = {}; //array of settings from the config and common config
        this.counters = {};
        this.usersAllocation = {};
        this.halls = {};
        this.segmentsAllocation = {};
        this.servicesAllocation = {};
        
        
    }
}

module.exports = branchConfig;

        