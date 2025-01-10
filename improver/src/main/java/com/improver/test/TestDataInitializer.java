package com.improver.test;

import com.improver.entity.*;
import com.improver.exception.NotFoundException;
import com.improver.exception.ValidationException;
import com.improver.model.UserAddressModel;
import com.improver.model.in.Order;
import com.improver.repository.*;
import com.improver.service.ReviewService;
import com.improver.util.enums.State;
import com.improver.util.serializer.SerializationUtil;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.io.IOUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Profile;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.core.io.support.ResourcePatternUtils;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.util.*;
import java.util.concurrent.ThreadLocalRandom;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import static com.improver.application.properties.Environments.*;
import static com.improver.application.properties.Path.IMAGES_PATH;
import static java.util.Objects.nonNull;

/**
 * This temp class to set images for {@link ServiceType}
 *
 * @author Mykhailo Soltys
 */
@Slf4j
@Component
@Profile({INITDB})
public class TestDataInitializer {


    public static final String PATH_IMGS_SERVICE_TILING ="test-data/services/tiling/";

    @Autowired private ResourceLoader resourceLoader;
    @Autowired private CompanyConfigRepository companyConfigRepository;
    @Autowired private ProjectMessageRepository projectMessageRepository;
    @Autowired private TradeRepository tradeRepository;
    @Autowired private ServiceTypeRepository serviceTypeRepository;
    @Autowired private CustomerRepository customerRepository;
    @Autowired private ContractorRepository contractorRepository;
    @Autowired private ProjectRepository projectRepository;
    @Autowired private ProjectRequestRepository projectRequestRepository;
    @Autowired private DemoProjectRepository demoProjectRepository;
    @Autowired private CompanyRepository companyRepository;
    @Autowired private TransactionRepository transactionRepository;
    @Autowired private LicenseRepository licenseRepository;
    @Autowired private BillRepository billRepository;
    @Autowired private ReviewService reviewService;
    @Autowired private QuestionRepository questionRepository;
    @Autowired private ImageRepository imageRepository;
    @Autowired private ProjectImageRepository projectImageRepository;
    @Autowired private TestFileUtil testFileUtil;
    @Autowired private DemoProjectImageRepository demoProjectImageRepository;
    @Autowired private QuestionaryRepository questionaryRepository;
    @Autowired private AreaRepository areaRepository;
    @Autowired private AdminRepository adminRepository;
    @Autowired private SupportRepository supportRepository;
    @Autowired private StakeholderRepository stakeholderRepository;
    @Autowired private ProjectActionRepository projectActionRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private RefundRepository refundRepository;
    @Autowired private UnavailabilityPeriodRepository unavailabilityPeriodRepository;
    @Autowired private TestPaymentAccountResolver testPaymentAccountResolver;
    @Autowired private ServedZipRepository servedZipRepository;
    @Autowired private TestQuestionaryGenerator testQuestionaryGenerator;
    @Autowired private UserAddressRepository userAddressRepository;

    private static final String TILE_INSTALLATION = "Tile Installation";
    private static final String ARCHITECTURAL_SERVICES = "Architectural Services";
    private static final String BATHROOM_PAINTING = "Bathroom Painting";
    private static final String DEMO_PASS = "2019bestHOMEimprove";
    private static final String ADMIN_DEMO_PASS = DEMO_PASS + "!";

    private static final String DEMO_PHONE = "9231231234";
    private static final String VISA_ENDING_IN_1132 = "Visa ending in 1132";


    private static final String CUST_1 = "user.improver@gmail.com";
    private static final String CUST_2 = "user2.improver@gmail.com";
    private static final String CUST_3 = "user3@gmail.com";
    private static final String CUST_4 = "user4@gmail.com";
    private static final String CUST_5 = "amazonit555@gmail.com";
    private static final String CUST_6 = "user6@gmail.com";

    private static final String PRO_1 = "contractor.improver@gmail.com";
    private static final String PRO_2 = "contractor2.improver@gmail.com";
    private static final String PRO_3 = "contractor3@gmail.com";
    private static final String PRO_4 = "contractor4@gmail.com";
    private static final String PRO_5 = "tester.cloud@outlook.com";

    private static final String ADMIN_1 = "ad.improver@gmail.com";
    private static final String SUPPORT_1 = "sup.improver@gmail.com";
    private static final String SUPPORT_2 = "sup2.improver@gmail.com";
    private static final String STAKEHOLDER_1 = "sh.improver@gmail.com";

    private List<String> supportedServices;

    private static Location DUMMY_LOCATION = new Location("123 Bengamin st.", "New York", "NY", "12345");


    public void initProd() {
        log.info("*********** Init PROD Trades images ...");
        try {
            setServicesImagesIntoDb("classpath*:**/test-data/trades/*.jpg");
        } catch (IOException e) {
            log.error("Failed to load images for ServiceTypes", e);
        }
    }

    @PostConstruct
    public void initTestData() {
        initProd();

        log.info("Start test data ======================================");
        log.info("=========== Init Test Questionary ...");
        initQuestions();
        log.info("=========== Init Test Users ...");
        initUsers();
        log.info("=========== Init Test Companies ...");
        initCompanies();
        // supportedServices = pro1().getCompany().getServiceTypes().stream().map(ServiceType::getName).collect(Collectors.toList());
        supportedServices = Arrays.asList("Hello");
        log.info("=========== Init Test UnavailabilityPeriods ...");
        initUnavailabilityPeriods();
        log.info("=========== Init Test Projects ...");
        //initProjects();
        log.info("=========== Init Test Demo Projects ...");
        initDemoProjects();
        log.info("=========== Init Test Transactions ...");
        //initTransactions();
        log.info("=========== Init Test Reviews ...");
        initReviews();
        log.info("=========== Init Test Licenses ...");
        initLicenses();
        log.info("END test data ==============================================");
    }

    private String randomService() {
        int random = new Random().nextInt(supportedServices.size());
        return supportedServices.get(random);
    }


    private ZonedDateTime getRandomDate() {
        return ZonedDateTime.now().minusDays(ThreadLocalRandom.current().nextInt(2, 100));
    }

    private ZonedDateTime getFreshRandomDate() {
        return ZonedDateTime.now().minusHours(ThreadLocalRandom.current().nextInt(1, 200));
    }

    private void initProjects() {
        createValidationLead(randomService(), cust1(), Project.Reason.INVALID_LOCATION);
        createValidationLead(randomService(), cust3(), Project.Reason.INVALID_USER);
        createValidationLead(randomService(), cust2(), Project.Reason.DUPLICATED);
        createValidationLead(randomService(), cust4(), Project.Reason.INVALID_SERVICE);
        createInvalidLead(randomService(), cust1());
        createInvalidLead(randomService(), cust2());

        //===
        createLead(randomService(), cust2());
        createLead(randomService(), cust1());
        createLead(randomService(), cust1());
        createLead(randomService(), cust3());
        createLead(randomService(), cust2());
        createLead(randomService(), cust1());
        createLead(randomService(), cust3());
        createLead(randomService(), cust3());

        createProject(randomService(), cust4(), Arrays.asList(pro1(), pro5()), Collections.singletonList(pro2()), getRandomDate());
        createProject(randomService(), cust5(), Arrays.asList(pro1(), pro5()), Collections.singletonList(pro2()), getRandomDate());
        createProject(randomService(), cust6(), Collections.singletonList(pro1()), Arrays.asList(pro2(), pro5()), getRandomDate());
        Project withImg = createProject(randomService(), cust1(), Arrays.asList(pro1(), pro2(), pro3()), Collections.singletonList(pro5()), getFreshRandomDate());
        Stream.of(1, 2, 3, 4, 5, 6, 7, 8, 9)
            .forEach(i -> saveProjectImage(withImg, "test-data/projects/kitchen-photo-" + i + ".jpg"));
        createProject(randomService(), cust1(), Arrays.asList(pro1(), pro2()), Collections.emptyList(), getFreshRandomDate());
        createProjectWithStatus(randomService(), cust1(), Arrays.asList(pro2(), pro4()), Collections.singletonList(pro1()), Project.Status.COMPLETED, getRandomDate());
        createProjectWithStatus(randomService(), cust1(), Arrays.asList(pro2(), pro3()), Arrays.asList(pro1(), pro5()), Project.Status.CANCELED, getRandomDate());
    }

    private Project createLead(String serviceName, Customer customer) {
        ServiceType serviceType = serviceTypeRepository.findByName(serviceName);
        Order order = TestOrderHelper.generateFor(serviceName);
        Order.BaseLeadInfo details = order.getBaseLeadInfo();
        Centroid centroid = servedZipRepository.findByZip(order.getAddress().getLocation().getZip())
            .orElseThrow(() -> new ValidationException("zip not found"))
            .getCentroid();
        Project project = new Project()
            .setCentroid(centroid)
            .setServiceName(serviceName)
            .setLead(true)
            .setLeadPrice(serviceType.getLeadPrice())
            .setCustomer(customer)
            .setServiceType(serviceType)
            .setLocation(order.getAddress().getLocation())
            .setStartDate(details.getStartExpectation())
            .setDetails(SerializationUtil.toJson(order.getQuestionary()))
            .setNotes(order.getBaseLeadInfo().getNotes())
            .setStatus(Project.Status.ACTIVE)
            .setCreated(getFreshRandomDate());
        return projectRepository.save(project);
    }

    private void saveUserAddress(Customer customer, Location location) {
        userAddressRepository.save(new UserAddress(customer, location));
    }




    private Project createValidationLead(String serviceName, Customer customer, Project.Reason reason) {
        Project project = createLead(serviceName, customer);
        projectActionRepository.save(ProjectAction.systemComment("Possible duplication. Require Manual Support check")
            .setProject(project)
        );

        return projectRepository.save(project
            .setLead(false)
            .setStatus(Project.Status.VALIDATION)
            .setReason(reason)
            .setUpdated(ZonedDateTime.now())
        );
    }

    private Project createInvalidLead(String serviceName, Customer customer) {
        Project project = createValidationLead(serviceName, customer, Project.Reason.INVALID_LOCATION);
        projectActionRepository.save(
            ProjectAction.invalidateProject(Project.Reason.INVALID_LOCATION, DUMMY_LOCATION.asText() + " not existed address", getUser(ADMIN_1))
                .setProject(project));

        return projectRepository.save(project
            .setLead(false)
            .setStatus(Project.Status.INVALID)
            .setReason(Project.Reason.INVALID_LOCATION)
            .setUpdated(ZonedDateTime.now())
        );
    }



    private Project createProjectWithStatus(String serviceType, Customer customer, List<Contractor> actives, List<Contractor> canceled, Project.Status status, ZonedDateTime date) {
        Project lead = createLead(serviceType, customer);
        lead.setCreated(nonNull(date) ? date : getRandomDate());
        List<ProjectRequest> projectRequests = new ArrayList<>();
        for (Contractor activeContractor : actives) {
            projectRequests.add(createTestProjectRequest(activeContractor, lead));
        }
        for (Contractor canceledContractor : canceled) {
            projectRequests.add(createDeclined(canceledContractor, lead));
        }

        boolean isLead = Project.Status.forPurchase().contains(status);
        return projectRepository.save(lead.setLead(isLead)
            .setStatus(status)
            .setUpdated(ZonedDateTime.now())
            .setFreePositions(lead.getFreePositions() - projectRequests.size())
            .setProjectRequests(projectRequests));
    }

    private Project createProject(String serviceType, Customer customer, List<Contractor> actives, List<Contractor> canceled, ZonedDateTime date) {
        return createProjectWithStatus(serviceType, customer, actives, canceled, Project.Status.IN_PROGRESS, date);
    }


    private ProjectRequest createDeclined(Contractor contractor, Project project) {
        ZonedDateTime created = TestDateUtil.randomDateFrom(project.getCreated());
        ZonedDateTime declined = TestDateUtil.randomDateFrom(created);
        ProjectRequest projectRequest = createTestProjectRequest(contractor, project, declined);
        ProjectRequest saved = projectRequestRepository.save(projectRequest.setStatus(ProjectRequest.Status.DECLINED).setCreated(created));
        projectMessageRepository.save(ProjectMessage.decline(projectRequest, declined));
        return saved;
    }


    private void initQuestions() {
        saveQuestionary(testQuestionaryGenerator.kitchenTilingQuestionary(questionaryRepository.save(new Questionary())), TILE_INSTALLATION);
        saveQuestionary(testQuestionaryGenerator.architecturalServices(questionaryRepository.save(new Questionary())), ARCHITECTURAL_SERVICES);
        saveQuestionary(testQuestionaryGenerator.bathroomPainting(questionaryRepository.save(new Questionary())), BATHROOM_PAINTING);
    }

    private void saveQuestionary(Questionary questionary, String... serviceTypeNames) {
        List<ServiceType> services = serviceTypeRepository.findByNameIn(Arrays.asList(serviceTypeNames));
        Questionary saved = questionaryRepository.save(questionary.addServices(services));
        questionary.setQuestions(saved.getQuestions()).reprocessNames();
        questionRepository.saveAll(questionary.getQuestions());

    }

    private Customer createCustomer(String email, String firstName, String lastName, String phone, String iconUrl) {
        Customer customer = new Customer(firstName, lastName, email, DEMO_PASS, phone)
            .setIconUrl(iconUrl)
            .setActivated(true);
        return customerRepository.save(customer);
    }

    private void initUsers() {

        Customer customer = createCustomer(CUST_1, "John", "Down", DEMO_PHONE, saveImage("test-data/icons/user-icon-1.jpg"));
        createCustomer(CUST_2, "Bruce", "Willis", DEMO_PHONE, saveImage("test-data/icons/user-icon-2.jpg"));
        createCustomer(CUST_3, "Jim", "Beam", DEMO_PHONE, saveImage("test-data/icons/user-icon-3.jpg"));
        createCustomer(CUST_4, "Clark", "Kent", DEMO_PHONE, null);
        createCustomer(CUST_5, "Victoria", "Secret", DEMO_PHONE, null);
        createCustomer(CUST_6, "Sara-Michel", "Hellar", DEMO_PHONE, null);

       TestOrderHelper.getValidLocations().forEach( location -> {
           saveUserAddress(customer, location);
       });

        Contractor.NotificationSettings defaultProNotificationSettings = new Contractor.NotificationSettings();
        defaultProNotificationSettings.setReceiveNewSubscriptionLeadsSms(false);

        contractorRepository.save(new Contractor("Lory", "Macalister", PRO_1, DEMO_PASS, DEMO_PHONE)
            .setQuickReply(true)
            .setActivated(true)
            .setReplyText("Hi, we received your project request from Home Improve and would love to discuss this with you. " +
                "Please let us know a convenient time for you. We look forward to connecting with you.\nThanks, " +
                "Lory from Bravo inc")
            .setNotificationSettings(defaultProNotificationSettings)
        );

        contractorRepository.save(new Contractor("James", "Brown", PRO_2, DEMO_PASS, DEMO_PHONE)
            .setActivated(true)
            .setCreated(ZonedDateTime.now().minusYears(2).minusMonths(1))
            .setNotificationSettings(defaultProNotificationSettings)
        );

        contractorRepository.save(new Contractor("Tod", "Googled", PRO_3, DEMO_PASS, DEMO_PHONE)
            .setActivated(true)
            .setNotificationSettings(defaultProNotificationSettings)
        );

        contractorRepository.save(new Contractor("Mike", "Mucus", PRO_4, DEMO_PASS, DEMO_PHONE)
            .setActivated(true)
            .setCreated(ZonedDateTime.now().minusYears(2).plusMonths(2))
            .setNotificationSettings(defaultProNotificationSettings)
        );

        contractorRepository.save(new Contractor("Example", "Pro", PRO_5, DEMO_PASS, DEMO_PHONE)
            .setActivated(true)
            .setNotificationSettings(defaultProNotificationSettings)
        );

        adminRepository.save(new Admin("Bridget", "Jones", ADMIN_1, ADMIN_DEMO_PASS, DEMO_PHONE)
            .setActivated(true)
            .setCreated(ZonedDateTime.now().minusYears(1).minusMonths(4))
        );

        supportRepository.save(new Support("John", "Wick", SUPPORT_1, DEMO_PASS, DEMO_PHONE)
            .setActivated(true)
        );

        supportRepository.save(new Support("Edvard", "Norton", SUPPORT_2, DEMO_PASS, DEMO_PHONE)
            .setActivated(true)
        );

        stakeholderRepository.save(new Stakeholder("Johny", "Cash", STAKEHOLDER_1, DEMO_PASS, DEMO_PHONE)
            .setActivated(true)
            .setCreated(ZonedDateTime.now().minusYears(1).minusMonths(4))
        );

    }

    private void createCompanies() {
        Company company = companyRepository.save(
            new Company()
                .setName("North America Development Group, LLC")
                .setFounded(2010)
                .setExtendedLocation(new ExtendedLocation(new Location("509 Madison Ave Rm 2004", "New York", "NY", "10022" ), 40.7594361, -73.9764019))
                .setDescription("Our company was established in 2012 in New-York city. The company works in 3 states: New-York, Connecticut and New-Jersey. " +
                    "Our specialties include the following but are not limited to: masonry, block/CMU, thin brick/modular brick, limestone manufactory/installation, " +
                    "natural stone/manufactured stone veneer, hardcoat stucco (2 coat stucco), pavers/Belgian block. We are doing shop tickets (manufacture) and shop drawing (installation) for our projects"));
        companyRepository.save(
            new Company()
                .setName("Total Home Service, LLC")
                .setFounded(2005)
                .setExtendedLocation(new ExtendedLocation(new Location("93 Fairview Ave", "Jersey City", "NJ", "07304" ), 40.7233233, -74.0748161))
                .setDescription("We are best Company ever"));
        companyRepository.save(
            new Company()
                .setName("Diamond One Constructions")
                .setFounded(2009)
                .setExtendedLocation(new ExtendedLocation(new Location("400 Madison Ave Rm 2000", "New York", "NY", "10021" ), 40.7562408, -73.9792458))
                .setDescription("We are best Company ever"));
        companyRepository.save(
            new Company()
                .setName("Medina Christians LTD")
                .setFounded(2015)
                .setExtendedLocation(new ExtendedLocation(new Location("509 Madison Ave Rm 192", "New York", "NY", "10020" ), 40.7594361, -73.9764019))
                .setDescription("We are best Company ever"));
        companyRepository.save(
            new Company()
                .setName("Example Company")
                .setFounded(2013)
                .setExtendedLocation(new ExtendedLocation(new Location("509 Madison Ave Rm 333", "New York", "NY", "10019" ), 40.7594361, -73.9764019))
                .setDescription("We are best Company ever"));

        String[] zipCods = new String[]{"07001", "07002", "07003", "07008", "07010", "07012", "07014", "07016", "07017", "07018", "07020", "07022",
            "07024", "07026", "07029", "07030", "07031", "07032", "07033", "07036", "07040", "07041", "07047", "07050", "07052", "07055", "07057",
            "07064", "07065", "07066", "07070", "07071", "07072", "07073", "07074", "07075", "07079", "07081", "07083", "07086", "07087", "07090",
            "07093", "07094", "07102", "07103", "07104", "07105", "07106", "07107", "07108", "07109", "07110", "07111", "07112", "07114", "07201",
            "07202", "07203", "07204", "07205", "07206", "07208", "07302", "07304", "07305", "07306", "07307", "07310", "07601", "07603", "07604",
            "07605", "07606", "07607", "07608", "07620", "07621", "07624", "07626", "07627", "07628", "07631", "07632", "07641", "07643", "07644",
            "07646", "07648", "07649", "07650", "07652", "07657", "07660", "07661", "07662", "07663", "07666", "07670", "10001", "10002", "10003",
            "10004", "10005", "10006", "10007", "10009", "10010", "10011", "10012", "10013", "10014", "10016", "10017", "10018", "10019", "10020",
            "10021", "10022", "10023", "10024", "10025", "10026", "10027", "10028", "10029", "10030", "10031", "10032", "10033", "10034", "10035",
            "10036", "10037", "10038", "10039", "10040", "10044", "10069", "10103", "10110", "10111", "10112", "10119", "10128", "10153", "10165",
            "10167", "10168", "10169", "10170", "10171", "10172", "10173", "10174", "10177", "10199", "10278", "10280", "10282", "10301", "10302",
            "10303", "10304", "10305", "10306", "10308", "10309", "10310", "10312", "10314", "10451", "10452", "10453", "10454", "10455", "10456",
            "10457", "10458", "10459", "10460", "10461", "10462", "10463", "10465", "10466", "10467", "10468", "10469", "10470", "10471", "10472",
            "10473", "10474", "10475", "10528", "10538", "10543", "10550", "10552", "10553", "10580", "10701", "10703", "10704", "10705", "10707",
            "10708", "10709", "10710", "10801", "10803", "10804", "10805", "11001", "11003", "11004", "11005", "11010", "11020", "11021", "11023",
            "11024", "11030", "11040", "11042", "11050", "11096", "11101", "11102", "11103", "11104", "11105", "11106", "11109", "11201", "11203",
            "11204", "11205", "11206", "11207", "11208", "11209", "11210", "11211", "11212", "11213", "11214", "11215", "11216", "11217", "11218",
            "11219", "11220", "11221", "11222", "11223", "11224", "11225", "11226", "11228", "11229", "11230", "11231", "11232", "11233", "11234",
            "11235", "11236", "11237", "11238", "11239", "11354", "11355", "11356", "11357", "11358", "11360", "11361", "11362", "11363", "11364",
            "11365", "11366", "11367", "11368", "11369", "11370", "11371", "11372", "11373", "11374", "11375", "11377", "11378", "11379", "11385",
            "11411", "11412", "11413", "11414", "11415", "11416", "11417", "11418", "11419", "11420", "11421", "11422", "11423", "11424", "11426",
            "11427", "11428", "11429", "11430", "11432", "11433", "11434", "11435", "11436", "11501", "11507", "11509", "11514", "11516", "11518",
            "11530", "11542", "11545", "11547", "11548", "11550", "11552", "11557", "11559", "11561", "11563", "11565", "11568", "11570", "11572",
            "11576", "11577", "11579", "11580", "11581", "11590", "11596", "11598", "11691", "11692", "11693", "11694", "11697", "10464", "11451",
            "10311", "11359", "11425", "07088", "07505", "10162", "07028", "07504", "07506", "07642", "07502", "10503", "10152", "07021", "07452",
            "07432", "10976", "10271", "07078", "10115", "10279", "07508", "10522", "07647", "10964", "07417", "07423", "07524", "10583", "10502",
            "10154", "11351", "07009", "07013", "07503", "07407", "07630", "07675", "07039", "07011", "07640", "07044", "10968", "07035", "07514",
            "07677", "07424", "07410", "10706", "07311", "07936", "07513", "07522", "07458", "07481", "07656", "07676", "07901", "07043", "07068",
            "07463", "07006", "07042", "10533", "10962", "07512", "07450", "07501", "10530", "07470", "07004", "10983"};

        List<Area> companyAreas = new ArrayList<>();
        for (String zipCod : zipCods) {
            companyAreas.add(new Area(zipCod, company));
        }
        areaRepository.saveAll(companyAreas);

    }


    @Deprecated
    private void initCompanies() {
        createCompanies();

        List<Trade> trades = tradeRepository.findByIdIn(Arrays.asList(1L, 5L, 7L));
        List<ServiceType> serviceTypes = trades.stream()
            .flatMap(trade -> trade.getServiceTypes().stream())
            .filter(serviceType -> (serviceType.getId() % 4 != 0))
            .collect(Collectors.toList());
        List<ServiceType> otherServices = serviceTypeRepository.findByNameContaining("Solar Panel");
        serviceTypes.addAll(otherServices);

        Company firstCompany = updateCompany(1L, PRO_1, 0, trades, serviceTypes, null);
        List<String> zips = firstCompany.getAreas().stream()
            .map(area -> area.getZip())
            .collect(Collectors.toList());
        updateCompany(2L, PRO_2, 13300, trades, serviceTypes, zips);
        updateCompany(3L, PRO_3, 19000, trades, serviceTypes, zips);
        updateCompany(4L, PRO_4, 12000, trades, serviceTypes, zips);
        updateCompany(5L, PRO_5, 99900, trades, serviceTypes, zips);
    }

    private Company updateCompany(long companyId, String contractorEmail, int balance, List<Trade> trades, List<ServiceType> serviceTypes, List<String> zips) {
        Company company = companyRepository.findById(companyId)
            .orElseThrow(NotFoundException::new);
        companyRepository.save(company.setServiceTypes(serviceTypes)
            .setTrades(trades)
            .setIconUrl(saveImage("test-data/icons/company-icon-" + companyId + ".jpg"))
            .setCreated(ZonedDateTime.now().minusMonths(companyId - 1L))
        );
        companyConfigRepository.save(CompanyConfig.defaultSettings(company));

        String stripeId = contractorEmail.equals(PRO_5) ? testPaymentAccountResolver.getContractor2Id()
            : testPaymentAccountResolver.getContractor1Id();
        billRepository.save(new Billing()
            .setStripeId(stripeId)
            .setBalance(balance)
            .setSubscription(new Subscription())
            .setCompany(company)
        );


        contractorRepository.save(getContractor(contractorEmail).setCompany(company));
        if (zips != null) {
            List<Area> areas = zips.stream()
                .map(zip -> new Area().setCompany(company).setZip(zip))
                .collect(Collectors.toList());
            areaRepository.saveAll(areas);
        }

        return company;
    }

    private void initUnavailabilityPeriods() {
        Company company = companyRepository.getOne(1L);
        LocalDate from = getRandomDate().toLocalDate();
        unavailabilityPeriodRepository.save(new UnavailabilityPeriod()
            .setCompany(company)
            .setFromDate(from)
            .setTillDate(from.plusDays(8))
            .setReason(UnavailabilityPeriod.Reason.DAY_OFF));
        from = getRandomDate().toLocalDate();
        unavailabilityPeriodRepository.save(new UnavailabilityPeriod()
            .setCompany(company)
            .setFromDate(from)
            .setTillDate(from.plusDays(33))
            .setReason(UnavailabilityPeriod.Reason.VACATION));
        from = getRandomDate().toLocalDate();
        unavailabilityPeriodRepository.save(new UnavailabilityPeriod()
            .setCompany(company)
            .setFromDate(from)
            .setTillDate(from.plusDays(2))
            .setReason(UnavailabilityPeriod.Reason.OUT_OF_TOWN));
    }


    private void initDemoProjects() {
        DemoProject withImg = demoProjectRepository.save(new DemoProject()
            .setName("Brick house")
            .setDescription("Brick whole hose with stone in 7 month. We did all job from planing till the end.")
            .setCompany(getContractor(PRO_1).getCompany())
            .setLocation(DUMMY_LOCATION)
            .setServiceTypes(Arrays.asList(TILE_INSTALLATION, ARCHITECTURAL_SERVICES))
            .setDate(getRandomDate().toLocalDate())
            .setPrice(2_577_000)
            .setCoverUrl(saveImage("test-data/projects/brick-house.jpg"))
        );
        Stream.of(1, 2, 3, 4, 5, 6, 7, 8, 9)
            .forEach(i -> saveDemoProjectImage(withImg, "test-data/projects/kitchen-photo-" + i + ".jpg"));

        demoProjectRepository.save(new DemoProject()
            .setName("Kitchen from scratch")
            .setDescription("We did all job from planing till the end.")
            .setCompany(getContractor(PRO_1).getCompany())
            .setLocation(DUMMY_LOCATION)
            .setServiceTypes(Arrays.asList(TILE_INSTALLATION, ARCHITECTURAL_SERVICES))
            .setDate(getRandomDate().toLocalDate())
            .setPrice(7_000)
        );

        demoProjectRepository.save(new DemoProject()
            .setName("Wooden Attic")
            .setDescription("I remember it like it was yesterday. The sun wa unusual bright and that rain... It reminded me my childhood."
                + "Raindrops are such funny things.\n" +
                "They haven't feet or haven't wings.\n" +
                "Yet they sail throughout he air\n" +
                "With the greatest of ease,\n" +
                "And dance on the street\n" +
                "Wherever they please.")
            .setCompany(getContractor(PRO_1).getCompany())
            .setLocation(DUMMY_LOCATION)
            .setServiceTypes(Arrays.asList(TILE_INSTALLATION))
            .setDate(getRandomDate().toLocalDate())
            .setPrice(7_000)
        );

        demoProjectRepository.save(new DemoProject()
            .setName("Wooden Attic")
            .setDescription("If you awaken from this illusion and you understand that black implies white, self implies other, " +
                "life implies death (or shall I say death implies life?), you can feel yourself – not as a stranger in the world, " +
                "not as something here on probation, not as something that has arrived here by fluke - but you can begin to feel your " +
                "own existence as absolutely fundamental.")
            .setCompany(getContractor(PRO_1).getCompany())
            .setLocation(DUMMY_LOCATION)
            .setServiceTypes(Arrays.asList(TILE_INSTALLATION))
            .setDate(getRandomDate().toLocalDate())
            .setPrice(950)
        );

        demoProjectRepository.save(new DemoProject()
            .setName("Think a lot ...")
            .setDescription("What we have forgotten is that thoughts and words are conventions, and that it is fatal to take conventions too seriously. " +
                "A convention is a social convenience, as, for example, money ... " +
                "but it is absurd to take money too seriously, to confuse it with real wealth ... In somewhat the same way, thoughts, ideas and words are 'coins' for real things.")
            .setCompany(getContractor(PRO_5).getCompany())
            .setLocation(DUMMY_LOCATION)
            .setServiceTypes(Arrays.asList(TILE_INSTALLATION))
            .setDate(getRandomDate().toLocalDate())
            .setPrice(3_500)
        );


    }


    private void initTransactions() {
        Company company = getContractor(PRO_1).getCompany();
        Company company2 = getContractor(PRO_2).getCompany();

        setTransactionsForCompany(company);
        setTransactionsForCompany(company2);

    }


    private void initReviews() {
        Company company = getContractor(PRO_1).getCompany();

        reviewService.addTestReview(new Review().setCompany(company)
            .setCustomer(cust1())
            .setCreated(ZonedDateTime.now().minusDays(50))
            .setDescription("The company did a great job! They were very attentive to details and made sure the process was running smooth and a on time manner.\n" +
                "The quality of the project is very high and the price is very fair as well.")
            .setScore(4)
            .setPublished(true)
        );

        reviewService.addTestReview(new Review().setCompany(company)
            .setCustomer(cust2())
            .setCreated(ZonedDateTime.now().minusDays(40))
            .setDescription("did a great job! They were very attentive to details and made sure the process was running smooth and a on time manner.\n" +
                "The quality of the project is very high and the price is very fair.")
            .setScore(5)
            .setPublished(true)
        );

        reviewService.addTestReview(new Review().setCompany(company)
            .setCustomer(cust3())
            .setCreated(ZonedDateTime.now().minusDays(30))
            .setDescription("The best")
            .setScore(5)
            .setPublished(true)
        );

        reviewService.addTestReview(new Review().setCompany(company)
            .setCustomer(cust1())
            .setCreated(ZonedDateTime.now().minusDays(20))
            .setDescription("nice work")
            .setScore(5)
            .setPublished(true)
        );

        reviewService.addTestReview(new Review().setCompany(company)
            .setCustomer(cust2())
            .setCreated(ZonedDateTime.now().minusDays(10))
            .setDescription("The company did a great job! They were very attentive to details and made sure the process was running smooth and a on time manner.\n" +
                "The quality of the project is very high and the price is very fair as well.")
            .setScore(3)
            .setPublished(true)
        );
    }

    private void initLicenses() {
        licenseRepository.save(new License().setCompany(getContractor(PRO_1).getCompany())
            .setState(State.NY)
            .setAccreditation("Electrical contractor")
            .setNumber("5555444433331223")
            .setExpired(LocalDate.now().plusYears(5))
        );

        licenseRepository.save(new License().setCompany(getContractor(PRO_1).getCompany())
            .setState(State.NY)
            .setAccreditation("Concrete test lab / Safety managers")
            .setNumber("1233434534534456656")
            .setExpired(LocalDate.now().plusYears(7))
        );

    }

    private void setTransactionsForCompany(Company company) {
        ZonedDateTime now = ZonedDateTime.now();
        int bonus = 20000;
        int topup = 6000;
        Billing bill = company.getBilling();

        // 1 Bonus
        bill.addToBalance(bonus);
        transactionRepository.save(Transaction.bonus(company, bonus, bill.getBalance(), "Initial bonus")
            .setCreated(now.minusMonths(7)));

        // 2 Top-up
        bill.addToBalance(topup);
        transactionRepository.save(Transaction.topupFor(Transaction.Type.TOP_UP, null, company, VISA_ENDING_IN_1132, "test-4332123", topup, bill.getBalance())
            .setCreated(now.minusMonths(6).plusDays(3)));

        // 3 projects
        ProjectRequest toRefund = null;
        List<ProjectRequest> projectRequests = projectRequestRepository.findByContractorId(getContractor(PRO_1).getId());
        for (ProjectRequest projectRequest : projectRequests) {
            Project project = projectRequest.getProject();
            bill.addToBalance(-project.getLeadPrice());
            if (projectRequest.getStatus().equals(ProjectRequest.Status.ACTIVE)) {
                toRefund = projectRequest;
            }
            transactionRepository.save(
                Transaction.leadFromBalance(projectRequest.isManual(),
                    company,
                    project.getServiceType().getName(),
                    projectRequest, project.getLocation(),
                    project.getLeadPrice(),
                    bill.getBalance()).setCreated(projectRequest.getCreated())
            );
        }

        // 4 Refund
        bill = billRepository.save(bill.addToBalance(toRefund.getProject().getLeadPrice()));
        transactionRepository.save(
            Transaction.leadFromBalance(toRefund.isManual(),
                company,
                toRefund.getProject().getServiceType().getName(),
                toRefund,
                toRefund.getProject().getLocation(),
                toRefund.getProject().getLeadPrice(),
                bill.getBalance())
                .setType(Transaction.Type.RETURN)
                .setCreated(now)
        );
        Transaction purchaseTransaction = transactionRepository.findByTypeAndCompanyAndProject(Transaction.Type.PURCHASE, company, toRefund.getId())
            .orElseThrow(NotFoundException::new);
        transactionRepository.save(purchaseTransaction.setRefunded(true));

        Refund refund = refundRepository.save(new Refund().setProjectRequest(toRefund)
            .setIssue(Refund.Issue.WRONG_ZIP)
            .setOption(Refund.Option.JOB_NOT_FOR_ZIP)
            .setStatus(Refund.Status.AUTO_APPROVED)
            .setCreated(now).setUpdated(now.plusMinutes(1))
        );

        projectRequestRepository.save(toRefund.setStatus(ProjectRequest.Status.REFUNDED).setRefund(refund));
    }

    private void setServicesImagesIntoDb(String pattern) throws IOException {
        Resource[] resources = ResourcePatternUtils.getResourcePatternResolver(resourceLoader).getResources(pattern);
        Map<String, Resource> images = new HashMap<>();
        for (Resource resource : resources) {
            images.put(resource.getFilename().split("\\.")[0], resource);
        }

        List<Trade> trades = tradeRepository.findAll();
        for (Trade trade : trades) {
                String imageUrls = saveImage(images.get(trade.getName()));
                trade.setImageUrls(String.join(",", imageUrls));
        }
        this.tradeRepository.saveAll(trades);
    }

    //============================

    /**
     * Creates a {@link ProjectRequest} with {@link ProjectRequest.Status#ACTIVE}
     * and {@link ProjectMessage} with {@link ProjectMessage.Type} type
     */
    private ProjectRequest createTestProjectRequest(Contractor contractor, Project project) {
        return createTestProjectRequest(contractor, project, ZonedDateTime.now());
    }

    private ProjectRequest createTestProjectRequest(Contractor contractor, Project project, ZonedDateTime conversationEnd) {
        ZonedDateTime created = TestDateUtil.randomDateBetween(project.getCreated(), conversationEnd).minusDays(1);
        ProjectRequest projectRequest = projectRequestRepository.save(new ProjectRequest().setContractor(contractor)
            .setCreated(created)
            .setUpdated(created.plusDays(1))
            .setProject(project)
            .setManual(true)
            .setStatus(ProjectRequest.Status.ACTIVE));
        projectMessageRepository.save(ProjectMessage.request(projectRequest, created));
        // chat
        List<ProjectMessage> conversation = TestRandomChatGenerator.generate(projectRequest, String.valueOf(contractor.getId()),
            String.valueOf(project.getCustomer().getId()), conversationEnd);
        projectMessageRepository.saveAll(conversation);
        return projectRequest;
    }


    private String saveImage(String path) {
        String ext = path.substring(path.lastIndexOf('.'));
        String name = UUID.randomUUID().toString().toLowerCase() + ext;
        byte[] bytes = testFileUtil.loadFile(path);
        imageRepository.save(new Image().setName(name)
            .setData(bytes)
            .setExtension(ext)
        );
        return IMAGES_PATH + '/' + name;
    }

    private String saveImage(Resource resource) throws IOException {
        String fileName = resource.getFilename();
        String ext = fileName.substring(fileName.lastIndexOf('.'));
        String name = UUID.randomUUID().toString().toLowerCase() + ext;
        byte[] bytes = IOUtils.toByteArray(resource.getInputStream());
        imageRepository.save(new Image().setName(name)
            .setData(bytes)
            .setExtension(ext)
        );
        return IMAGES_PATH + '/' + name;
    }

    private String saveProjectImage(Project project, String path) {
        String ext = path.substring(path.lastIndexOf('.'));
        String name = UUID.randomUUID().toString().toLowerCase() + ext;
        byte[] bytes = testFileUtil.loadFile(path);
        projectImageRepository.save(new ProjectImage(project, name, ext, bytes));
        String imageUrl = ProjectImage.toProjectImageUrl(project.getId(), name);
        if (!project.hasCover()) {
            projectRepository.save(project.setCoverUrl(imageUrl));
        }
        return imageUrl;
    }

    private String saveDemoProjectImage(DemoProject project, String path) {
        String ext = path.substring(path.lastIndexOf('.'));
        String name = UUID.randomUUID().toString().toLowerCase() + ext;
        byte[] bytes = testFileUtil.loadFile(path);
        demoProjectImageRepository.save(new DemoProjectImage(project, name, ext, bytes));
        return IMAGES_PATH + '/' + name;

    }


    private Contractor pro1() {
        return getContractor(PRO_1);
    }

    private Contractor pro2() {
        return getContractor(PRO_2);
    }

    private Contractor pro3() {
        return getContractor(PRO_3);
    }

    private Contractor pro4() {
        return getContractor(PRO_4);
    }

    private Contractor pro5() {
        return getContractor(PRO_5);
    }

    private Customer cust1() {
        return getCustomer(CUST_1);
    }

    private Customer cust2() {
        return getCustomer(CUST_2);
    }

    private Customer cust3() {
        return getCustomer(CUST_3);
    }

    private Customer cust4() {
        return getCustomer(CUST_4);
    }

    private Customer cust5() {
        return getCustomer(CUST_5);
    }

    private Customer cust6() {
        return getCustomer(CUST_6);
    }


    private Customer getCustomer(String email) {
        return customerRepository.findByEmail(email)
            .orElseThrow(NotFoundException::new);
    }

    private Contractor getContractor(String email) {
        return contractorRepository.findByEmail(email)
            .orElseThrow(NotFoundException::new);
    }

    private User getUser(String email) {
        return userRepository.findByEmail(email)
            .orElseThrow(NotFoundException::new);
    }


}
