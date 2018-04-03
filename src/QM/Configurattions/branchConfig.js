
class branchConfig {
    constructor() {
        this.ID;
        this.OrgID;
        this.Identity;
        this.SystemUsername;
        this.SystemPassword;
        this.Settings = {}; //array of settings from the config and common config
        this.Version;
        this.ServerDate;
        this.ServerTimeZone;



        //The Other attributes from other configs
        this.Counters = {};
        this.Services = {};
        this.KButtons = {};
        this.Users = {};
        this.Segments = {};
        this.PriorityRanges = {};
        this.UsersAllocation = {};
        this.Halls = {};
        this.segmentsAllocation = {};
        this.servicesAllocation = {};
        this.serviceSegmentAllocations = {};

        //public ServiceConfigEntity[] ServicesConfigurations;
        //public KButtonEntity[] KButtons;
        //public LanguageEntity[] Languages;
        //public ReportEntity[] Reports;
        //public PriorityRangeEntity[] PriorityRanges;
        //public CustomerIdentificationEntity[] CustomerIdentificationService;
        //public OrganizationLanguagesEntity[] OrganizationLanguages;
        //public QueueBranchEntity QueueBranch;
        //public CalendarEntity[] Calendars;
        //public AlertEntity[] Alerts;
        //public ServiceGroupEntity[] ServiceGroups;
        //public HoldingReasonEntity[] HoldingResons; 
        //public AdvertisementEntity[] Advertisements;
        //public CaptionEntity[] Captions;
        //public PlayerEntity[] Players;
        //public FileStorageEntity FileStorage;
        //public HallEntity[] Halls;


    }
}

module.exports = branchConfig;

        //var IsSettingFromFWXServer; SHOULD ALWAYS BE TRUE
        //var FWXServerURL; //i THINGK NO NEED FOR IT
        //var InfotrixNetworkInterface; // This is a branch data
        //var ComPort;
        //var BranchAdvertisementsAvailable;
        //public List<AudienceGroupsAllocationsWrapper> AudienceGroupAllocations { get; set; }
        //public CustomerAttributeEntity[] CustomerAttributes;
        //public TicketingWorkflowEntity[] TicketingWorkflows { get; set; }
        //public TicketingScreenEntity[] TicketingScreens { get; set; }
        //public TicketingButtonEntity[] TicketingButtons { get; set; }
        //public TicketingActivityGroupEntity[] TicketingActivityGroups { get; set; }


        //THINGS TO DISCUSS
        //[Calendar_ID]
        //[State_LV]
        //[StateParameter]
        //[LastUpdateTime]
        //[LastUpgradeTime]
        //[PhysicalFile_ID]
        //[RemoteAddress]
        //[IntegrationID]
        //[SecureBranchPortal]
        //[TicketFormatPhysicalFileId]



        //public CounterEntity[] Counters;
        //public ServiceEntity[] Services;
        //public ServiceConfigEntity[] ServicesConfigurations;
        //public KButtonEntity[] KButtons;
        //public UserEntity[] Users;
        //public LanguageEntity[] Languages;
        //public ReportEntity[] Reports;
        //public SegmentEntity[] Segments;
        //public PriorityRangeEntity[] PriorityRanges;
        //public CustomerIdentificationEntity[] CustomerIdentificationService;
        //public OrganizationLanguagesEntity[] OrganizationLanguages;
        //public QueueBranchEntity QueueBranch;
        //public CalendarEntity[] Calendars;
        //public AlertEntity[] Alerts;
        //public UsersPermissionWrapper UsersPermission;
        //public ServiceGroupEntity[] ServiceGroups;
        //public HoldingReasonEntity[] HoldingResons; 
        //public AdvertisementEntity[] Advertisements;
        //public CaptionEntity[] Captions;
        //public PlayerEntity[] Players;
        //public FileStorageEntity FileStorage;
        //public HallEntity[] Halls;