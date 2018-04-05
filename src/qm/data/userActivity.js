const INT_NULL = -1;
const STRING_NULL = "";
const TIME_NULL = 0;

class userActivity {
    //don't add the login/logout activies. 
    constructor() {
        this.id = INT_NULL;
        this.org_ID = INT_NULL;
        this.branch_ID = INT_NULL;
        
        this.type= INT_NULL;
        this.user_ID= INT_NULL;
        this.counter_ID= INT_NULL;
        this.startTime = TIME_NULL;
        this.endTime = TIME_NULL;
        this.lastActionTime = TIME_NULL;
        this.duration= INT_NULL;
        this.calenderDuration= INT_NULL;
        this.closed= INT_NULL;
   }
}
module.exports = userActivity;


