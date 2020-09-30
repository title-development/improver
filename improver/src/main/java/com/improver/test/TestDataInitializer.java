package com.improver.test;

import com.improver.entity.*;
import com.improver.exception.NotFoundException;
import com.improver.exception.ValidationException;
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
import javax.annotation.PostConstruct;
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
@Profile({INITDB, QA, PROD})
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

    private static final String TILE_INSTALLATION = "Tile Installation";
    private static final String ARCHITECTURAL_SERVICES = "Architectural Services";
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


    @PostConstruct
    public void init() {
        log.info("*********** Init PROD Trades images ...");
        try {
            setServicesImagesIntoDb("classpath*:**/test-data/trades/*.jpg");
        } catch (IOException e) {
            log.error("Failed to load images for ServiceTypes", e);
        }
        log.info("Start test data ======================================");
        log.info("=========== Init Test Questionary ...");
        initQuestions();
        log.info("=========== Init Test Users ...");
        initUsers();
        log.info("=========== Init Test Companies ...");
        initCompanies();
        supportedServices = pro1().getCompany().getServiceTypes().stream().map(ServiceType::getName).collect(Collectors.toList());
        log.info("=========== Init Test UnavailabilityPeriods ...");
        initUnavailabilityPeriods();
        log.info("=========== Init Test Projects ...");
        initProjects();
        log.info("=========== Init Test Demo Projects ...");
        initDemoProjects();
        log.info("=========== Init Test Transactions ...");
        initTransactions();
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
        Centroid centroid = servedZipRepository.findByZip(details.getLocation().getZip())
            .orElseThrow(() -> new ValidationException("zip not found"))
            .getCentroid();
        Project project = new Project()
            .setCentroid(centroid)
            .setServiceName(serviceName)
            .setLead(true)
            .setLeadPrice(serviceType.getLeadPrice())
            .setCustomer(customer)
            .setServiceType(serviceType)
            .setLocation(details.getLocation())
            .setStartDate(details.getStartExpectation())
            .setDetails(SerializationUtil.toJson(order.getQuestionary()))
            .setNotes(order.getBaseLeadInfo().getNotes())
            .setStatus(Project.Status.ACTIVE)
            .setCreated(getFreshRandomDate());
        return projectRepository.save(project);
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
    }

    private void saveQuestionary(Questionary questionary, String... serviceTypeNames) {
        List<ServiceType> services = serviceTypeRepository.findByNameIn(Arrays.asList(serviceTypeNames));
        Questionary saved = questionaryRepository.save(questionary.addServices(services));
        questionary.setQuestions(saved.getQuestions()).reprocessNames();
        questionRepository.saveAll(questionary.getQuestions());

    }

    private void createCustomer(String email, String firstName, String lastName, String phone, String iconUrl) {
        Customer customer = new Customer(firstName, lastName, email, DEMO_PASS, phone)
            .setIconUrl(iconUrl)
            .setActivated(true);
        customerRepository.save(customer);
    }

    private void initUsers() {

        createCustomer(CUST_1, "John", "Down", DEMO_PHONE, saveImage("test-data/icons/user-icon-1.jpg"));
        createCustomer(CUST_2, "Bruce", "Willis", DEMO_PHONE, saveImage("test-data/icons/user-icon-2.jpg"));
        createCustomer(CUST_3, "Jim", "Beam", DEMO_PHONE, saveImage("test-data/icons/user-icon-3.jpg"));
        createCustomer(CUST_4, "Clark", "Kent", DEMO_PHONE, null);
        createCustomer(CUST_5, "Victoria", "Secret", DEMO_PHONE, null);
        createCustomer(CUST_6, "Sara-Michel", "Hellar", DEMO_PHONE, null);

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


    private void initCompanies() {

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
