class branchConfig {
    constructor() {
        this.id;
        this.org_ID;
        this.identity;
        this.name_L1;
        this.name_L2;
        this.name_L3;
        this.name_L4;
        this.settings = {}; //array of settings from the config and common config
        this.counters = {};
        this.usersAllocation = {};
        this.halls = {};
        this.segmentsAllocation = {};
        this.servicesAllocation = {};       
    }
}

module.exports = branchConfig;

        