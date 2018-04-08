class branch_ServiceConfig {
    constructor() {
        this.id;
        this.org_ID;
        this.serviceType_LV;
        this.minServiceTime;
        this.minServiceTimeAfterOnHold;
        this.maxServiceTime;
        this.maxWaitingTime;
        this.kPI_AST_TargetValue;
        this.kPI_AST_MaxAcceptedValue;
        this.kPI_AST_StartValue;
        this.kPI_AST_EndValue;
        this.kPI_AWT_TargetValue;
        this.kPI_AWT_MaxAcceptedValue;
        this.kPI_AWT_StartValue;
        this.kPI_AWT_EndValue;
        this.kPI_TRE_TargetValue;
        this.kPI_TRE_MinAcceptedValue;
        this.kPI_TRE_StartValue;
        this.kPI_TRE_EndValue;
        this.kPI_PSC_TargetValue;
        this.kPI_PSC_MaxAcceptedValue;
        this.kPI_PSC_StartValue;
        this.kPI_PSC_EndValue;
        this.kPI_WCN_TargetValue;
        this.kPI_WCN_MaxAcceptedValue;
        this.kPI_WCN_StartValue;
        this.kPI_WCN_EndValue;

    }
}

module.exports = branch_ServiceConfig;