package com.improver.util.database.test;

import com.improver.entity.*;
import com.improver.exception.NotFoundException;
import com.improver.model.in.Order;
import com.improver.model.in.OrderDetails;
import com.improver.repository.*;
import com.improver.service.ReviewService;
import com.improver.util.FileUtil;
import com.improver.util.payment.TestPaymentAccountResolver;
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

import static com.improver.application.properties.Environments.DEV;
import static com.improver.application.properties.Environments.PROD;
import static com.improver.application.properties.Environments.QA;
import static com.improver.application.properties.Environments.STG;
import static com.improver.application.properties.Path.*;

/**
 * This temp class to set images for {@link ServiceType}
 *
 * @author Mykhailo Soltys
 */
@Slf4j
@Component
@Profile({DEV, PROD, STG, QA})
public class TestDataInitializer {

    @Autowired private ResourceLoader resourceLoader;
    @Autowired private CompanyConfigRepository companyConfigRepository;
    @Autowired private ProjectMessageRepository projectMessageRepository;
    @Autowired private TradeRepository tradeRepository;
    @Autowired private ServiceTypeRepository serviceTypeRepository;
    @Autowired private CustomerRepository customerRepository;
    @Autowired private ContractorRepository contractorRepository;
    @Autowired private ProjectRepository projectRepository;
    @Autowired private ProjectRequestRepository projectRequestRepository;
    @Autowired private GalleryProjectRepository galleryProjectRepository;
    @Autowired private CompanyRepository companyRepository;
    @Autowired private TransactionRepository transactionRepository;
    @Autowired private LicenseRepository licenseRepository;
    @Autowired private BillRepository billRepository;
    @Autowired private ReviewService reviewService;
    @Autowired private QuestionRepository questionRepository;
    @Autowired private ImageRepository imageRepository;
    @Autowired private ProjectImageRepository projectImageRepository;
    @Autowired private FileUtil fileUtil;
    @Autowired private CompanyImageRepository companyImageRepository;
    @Autowired private QuestionaryRepository questionaryRepository;
    @Autowired private AreaRepository areaRepository;
    @Autowired private AdminRepository adminRepository;
    @Autowired private SupportRepository supportRepository;
    @Autowired private StakeholderRepository stakeholderRepository;
    @Autowired private ProjectActionRepository projectActionRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private RefundRepository refundRepository;
    @Autowired private UnavailabilityPeriodRepository unavailabilityPeriodRepository;
    @Autowired private LicenseTypeRepository licenseTypeRepository;
    @Autowired private TestPaymentAccountResolver testPaymentAccountResolver;

    private static final String TILE_INSTALLATION = "Tile Installation";
    private static final String ARCHITECTURAL_SERVICES = "Architectural Services";
    private static final String DEMO_PASS = "improver1";
    private static final String DEMO_PHONE = "(123) 123-1234";
    private static final String REPLENISHMENT_DESCRIPTION_PART = "Payment card ending in ";


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
    private static final String STAKEHOLDER_1 = "sh.improver@gmail.com";

    private List<String> supportedServices;

    private static Location DUMMY_LOCATION = new Location("123 Bengamin st.", "New York", "NY", "12345");


    @PostConstruct
    public void init() {
            log.info("Start test data ======================================");
            log.info("=========== Init Test Questionary ...");
            initQuestions();
//            setServicesImagesIntoDb();
            try {
                setServicesImagesIntoDb("classpath*:**/tmp/trades/*.jpg");
            } catch (IOException e) {
                log.error("Failed to load images for ServiceTypes", e);
            }
            log.info("=========== Init Test Users ...");
            initUsers();
            log.info("=========== Init Test Companies ...");
            initCompanies();
            supportedServices = pro1().getCompany().getServiceTypes().stream().map(ServiceType::getName).collect(Collectors.toList());
            log.info("=========== Init Test UnavailabilityPeriods ...");
            initUnavailabilityPeriods();
            log.info("=========== Init Test Projects ...");
            initProjects();
            log.info("=========== Init Test Gallery Projects ...");
            initGalleryProjects();
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

        createProject(randomService(), cust4(), Arrays.asList(pro1(), pro5()), Collections.singletonList(pro2()));
        createProject(randomService(), cust5(), Arrays.asList(pro1(), pro5()), Collections.singletonList(pro2()));
        createProject(randomService(), cust6(), Collections.singletonList(pro1()), Arrays.asList(pro2(), pro5()));
        Project withImg = createProject(randomService(), cust1(), Arrays.asList(pro1(), pro3(), pro5()), Collections.singletonList(pro2()));
        Stream.of(1, 2, 3, 4, 5, 6, 7, 8, 9)
            .forEach(i -> saveProjectImage(withImg, "tmp/projects/kitchen-photo-" + i + ".jpg"));
        createProject(randomService(), cust1(), Arrays.asList(pro1(), pro2()), Collections.emptyList());
        createProjectWithStatus(randomService(), cust1(), Arrays.asList(pro2(), pro4()), Collections.singletonList(pro1()), Project.Status.COMPLETED);
        createProjectWithStatus(randomService(), cust1(), Arrays.asList(pro2(), pro3()), Arrays.asList(pro1(), pro5()), Project.Status.CANCELED);
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


    private Project createLead(String serviceName, Customer customer) {
        ServiceType serviceType = serviceTypeRepository.findByName(serviceName);
        Order order = OrderHelper.generateFor(serviceName);
        OrderDetails details = order.getDetails();

        Project project = new Project()
            .setLead(true)
            .setLeadPrice(serviceType.getLeadPrice())
            .setCustomer(customer)
            .setServiceType(serviceType)
            .setLocation(details.getLocation())
            .setStartDate(details.getStartExpectation().toString())
            .setDetails(SerializationUtil.toJson(order.getQuestionary()))
            .setNotes(order.getDetails().getNotes())
            .setStatus(Project.Status.ACTIVE)
            .setCreated(getFreshRandomDate());
        return projectRepository.save(project);
    }


    private Project createProjectWithStatus(String serviceType, Customer customer, List<Contractor> actives, List<Contractor> canceled, Project.Status status) {
        Project lead = createLead(serviceType, customer);
        lead.setCreated(getRandomDate());
        List<ProjectRequest> projectRequests = new ArrayList<>();
        for (Contractor activeContractor : actives) {
            projectRequests.add(createTestProjectRequest(activeContractor, lead));
        }
        for (Contractor canceledContractor : canceled) {
            projectRequests.add(createDeclined(canceledContractor, lead));
        }

        // chat
        projectRequests.forEach(projectRequest -> {
            List<ProjectMessage> conversation = RandomChatGenerator.generate(
                projectRequest, String.valueOf(projectRequest.getContractor().getId()), String.valueOf(projectRequest.getProject().getCustomer().getId()));
            projectMessageRepository.saveAll(conversation);
        });

        boolean isLead = Project.Status.forPurchase().contains(status);
        return projectRepository.save(lead.setLead(isLead)
            .setStatus(status)
            .setUpdated(ZonedDateTime.now())
            .setFreePositions(lead.getFreePositions() - projectRequests.size())
            .setProjectRequests(projectRequests));
    }

    private Project createProject(String serviceType, Customer customer, List<Contractor> actives, List<Contractor> canceled) {
        return createProjectWithStatus(serviceType, customer, actives, canceled, Project.Status.IN_PROGRESS);
    }


    private ProjectRequest createDeclined(Contractor contractor, Project project) {
        ProjectRequest projectRequest = createTestProjectRequest(contractor, project);
        ZonedDateTime created = TestDateUtil.randomDateFrom(project.getCreated());
        ZonedDateTime declined = TestDateUtil.randomDateFrom(created);
        ProjectRequest saved = projectRequestRepository.save(projectRequest.setStatus(ProjectRequest.Status.DECLINED).setCreated(created));
        projectMessageRepository.save(ProjectMessage.decline(projectRequest, declined));
        return saved;
    }


    private void initQuestions() {
        saveQuestionary(QuestionaryInitializer.kitchenTilingQuestionary(questionaryRepository.save(new Questionary())), TILE_INSTALLATION);
        saveQuestionary(QuestionaryInitializer.architecturalServices(questionaryRepository.save(new Questionary())), ARCHITECTURAL_SERVICES);
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

        createCustomer(CUST_1, "John", "Down", DEMO_PHONE, saveImage("tmp/icons/user-icon-1.jpg"));
        createCustomer(CUST_2, "Bruce", "Willis", DEMO_PHONE, saveImage("tmp/icons/user-icon-2.jpg"));
        createCustomer(CUST_3, "Jim", "Beam", DEMO_PHONE, saveImage("tmp/icons/user-icon-3.jpg"));
        createCustomer(CUST_4, "Clark", "Kent", DEMO_PHONE, null);
        createCustomer(CUST_5, "Victoria", "Secret", DEMO_PHONE, null);
        createCustomer(CUST_6, "Sara-Michel", "Hellar", DEMO_PHONE, null);


        contractorRepository.save(new Contractor("Lory", "Macalister", PRO_1, DEMO_PASS, DEMO_PHONE)
            .setQuickReply(true)
            .setActivated(true)
            .setReplyText("Hi, we received your project request from Home Improve and would love to discuss this with you. " +
                "Please let us know a convenient time for you. We look forward to connecting with you! Thanks, " +
                "Lory from Bravo inc!")
        );

        contractorRepository.save(new Contractor("James", "Brown", PRO_2, DEMO_PASS, DEMO_PHONE)
            .setActivated(true)
            .setCreated(ZonedDateTime.now().minusYears(2).minusMonths(1))
        );

        contractorRepository.save(new Contractor("Tod", "Googled", PRO_3, DEMO_PASS, DEMO_PHONE)
            .setActivated(true)
        );

        contractorRepository.save(new Contractor("Mike", "Mucus", PRO_4, DEMO_PASS, DEMO_PHONE)
            .setActivated(true)
            .setCreated(ZonedDateTime.now().minusYears(2).plusMonths(2))
        );

        contractorRepository.save(new Contractor("Example", "Pro", PRO_5, DEMO_PASS + "1", DEMO_PHONE)
            .setActivated(true)
        );

        adminRepository.save(new Admin("Bridget", "Jones", ADMIN_1, DEMO_PASS, DEMO_PHONE)
            .setActivated(true)
            .setCreated(ZonedDateTime.now().minusYears(1).minusMonths(4))
        );

        supportRepository.save(new Support("John", "Wick", SUPPORT_1, DEMO_PASS, DEMO_PHONE)
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

        Company firstCompany = updateCompany("1", PRO_1, 0, trades, serviceTypes, null);
        List<String> zips = firstCompany.getAreas().stream()
            .map(area -> area.getZip())
            .collect(Collectors.toList());
        updateCompany("2", PRO_2, 13300, trades, serviceTypes, zips);
        updateCompany("3", PRO_3, 19000, trades, serviceTypes, zips);
        updateCompany("4", PRO_4, 12000, trades, serviceTypes, zips);
        updateCompany("5", PRO_5, 99900, trades, serviceTypes, zips);
    }

    private Company updateCompany(String companyId, String contractorEmail, int balance, List<Trade> trades, List<ServiceType> serviceTypes, List<String> zips) {
        Company company = companyRepository.findById(companyId)
            .orElseThrow(NotFoundException::new);
        companyRepository.save(company.setServiceTypes(serviceTypes)
            .setTrades(trades)
            .setIconUrl(saveImage("tmp/icons/company-icon-" + companyId + ".jpg"))
            .setCreated(ZonedDateTime.now().minusMonths(Long.parseLong(companyId) - 1L))
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
        Company company = companyRepository.getOne("1");
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


    private void initGalleryProjects() {
        GalleryProject withImg = galleryProjectRepository.save(new GalleryProject()
            .setName("Brick house")
            .setDescription("Brick whole hose with stone in 7 month. We did all job from planing till the end.")
            .setCompany(getContractor(PRO_1).getCompany())
            .setLocation(DUMMY_LOCATION)
            .setServiceTypes(Arrays.asList(TILE_INSTALLATION, ARCHITECTURAL_SERVICES))
            .setDate(getRandomDate().toLocalDate())
            .setPrice(2_577_000)
            .setCoverUrl(saveImage("tmp/projects/brick-house.jpg"))
        );
        Stream.of(1, 2, 3, 4, 5, 6, 7, 8, 9)
            .forEach(i -> saveGalleryProjectImage(withImg, "tmp/projects/kitchen-photo-" + i + ".jpg"));

        galleryProjectRepository.save(new GalleryProject()
            .setName("Kitchen from scratch")
            .setDescription("We did all job from planing till the end.")
            .setCompany(getContractor(PRO_1).getCompany())
            .setLocation(DUMMY_LOCATION)
            .setServiceTypes(Arrays.asList(TILE_INSTALLATION, ARCHITECTURAL_SERVICES))
            .setDate(getRandomDate().toLocalDate())
            .setPrice(7_000)
        );

        galleryProjectRepository.save(new GalleryProject()
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

        galleryProjectRepository.save(new GalleryProject()
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

        galleryProjectRepository.save(new GalleryProject()
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
            .setLicenseType(licenseTypeRepository.findById(1L).get())
            .setNumber("5555444433331223")
            .setExpired(LocalDate.now().plusYears(5))
        );

        licenseRepository.save(new License().setCompany(getContractor(PRO_1).getCompany())
            .setLicenseType(licenseTypeRepository.findById(2L).get())
            .setNumber("1233434534534456656")
            .setExpired(LocalDate.now().plusYears(7))
        );

    }

    private void setTransactionsForCompany(Company company) {
        ZonedDateTime now = ZonedDateTime.now();
        int bonus = 20000;
        int replenishment = 6000;
        Billing bill = company.getBilling();

        // 1 Bonus
        bill.addToBalance(bonus);
        transactionRepository.save(Transaction.bonus(company, bonus, bill.getBalance(), "Initial bonus")
            .setCreated(now.minusMonths(7)));

        // 2 Replenishment
        bill.addToBalance(replenishment);
        transactionRepository.save(Transaction.replenishmentFor(Transaction.Type.REPLENISHMENT, null, company, REPLENISHMENT_DESCRIPTION_PART + "0065", "test", replenishment, bill.getBalance())
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
                .setType(Transaction.Type.REFUND)
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

    private void setServicesImagesIntoDb() {
        Map<String, String> images = new HashMap<>();
        String path = "tmp/services/";
        images.put("Interior Design", (path + "127-templeofblues-interior-designer.jpg"));
        images.put("Kitchen Remodeling", (path + "30-kitchen-remodel-1136x450.jpg"));
        images.put("Carpet Cleaning", (path + "75-534301_orig.jpg"));
        images.put("House Cleaning", (path + "92-House-Cleaning-Services-in-El-Cajon.jpg"));
        images.put("Door Installation", (path + "133-doors.jpg"));
        images.put("General Contracting", (path + "192-mpc-general-contractor.jpg"));
        images.put("Landscaping Design", (path + "275-Planning-an-outdoor-space-landscaping.jpg"));
        images.put("Interior Painting", (path + "346-interior-paint-job-blue-color.jpg"));
        images.put("Swimming Pool Cleaning", (path + "378-pool-maintenance-banner.jpg"));
        images.put("Roof Repair or Maintenance", (path + "382-6320643.jpg"));
        images.put(TILE_INSTALLATION, (path + "kitchen-tiling.jpg"));

        List<ServiceType> all = serviceTypeRepository.findAll();
        for (ServiceType serviceType : all) {
            String imageUrl;
            if (images.containsKey(serviceType.getName())) {
                imageUrl = saveImage(images.get(serviceType.getName()));
                serviceTypeRepository.save(serviceType.setImageUrl(imageUrl));
            }
        }
    }

    private void setServicesImagesIntoDb(String pattern) throws IOException {
        Resource[] resources = ResourcePatternUtils.getResourcePatternResolver(resourceLoader).getResources(pattern);
        Map<String, Resource> images = new HashMap<>();
        for (Resource resource : resources) {
            images.put(resource.getFilename().split("\\.")[0], resource);
        }

        List<Trade> trades = tradeRepository.findAll();
        for (Trade trade : trades) {
            if (images.containsKey(trade.getName())) {
                for (ServiceType serviceType: trade.getServiceTypes()) {
                    // TODO: Remove this later. When image from Group is suitable for Service type then value of it will be empty String other way it will be null;
                    if (serviceType.getImageUrl() != null) {
                        String imageUrl = saveImage(images.get(trade.getName()));
                        serviceTypeRepository.save(serviceType.setImageUrl(imageUrl));
                    }
                }
            }
        }
    }

    //============================

    /**
     * Creates a {@link ProjectRequest} with {@link ProjectRequest.Status#ACTIVE}
     * and {@link ProjectMessage} with {@link ProjectMessage.Type} type
     */
    private ProjectRequest createTestProjectRequest(Contractor contractor, Project project) {
        ZonedDateTime now = ZonedDateTime.now();
        ZonedDateTime created = TestDateUtil.randomDateBetween(project.getCreated(), now).minusDays(1);
        ProjectRequest projectRequest = projectRequestRepository.save(new ProjectRequest().setContractor(contractor)
            .setCreated(created)
            .setUpdated(created.plusDays(1))
            .setProject(project)
            .setManual(true)
            .setStatus(ProjectRequest.Status.ACTIVE));
        projectMessageRepository.save(ProjectMessage.request(projectRequest, created));
        return projectRequest;
    }


    private String saveImage(String path) {
        String ext = path.substring(path.lastIndexOf('.'));
        String name = UUID.randomUUID().toString().toLowerCase() + ext;
        byte[] bytes = fileUtil.loadFile(path);
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
        byte[] bytes = fileUtil.loadFile(path);
        projectImageRepository.save(new ProjectImage(project, name, ext, bytes));
        String imageUrl = IMAGES_PATH + PROJECTS + '/' + name;
        if (!project.hasCover()) {
            projectRepository.save(project.setCoverUrl(imageUrl));
        }
        return imageUrl;
    }

    private String saveGalleryProjectImage(GalleryProject project, String path) {
        String ext = path.substring(path.lastIndexOf('.'));
        String name = UUID.randomUUID().toString().toLowerCase() + ext;
        byte[] bytes = fileUtil.loadFile(path);
        companyImageRepository.save(new CompanyImage(project, name, ext, bytes));
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
