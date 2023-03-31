// Protractor configuration file, see link for more information
// https://github.com/angular/protractor/blob/master/lib/config.ts

const {SpecReporter} = require('jasmine-spec-reporter');

/** To launch e2e test do the following steps:
 * 1. Run backend with "test" profile
 * 2. Run tests via "e2e" script
 *
 * Alternative option for step 2:
 * - start frontend server with "serve:test" script
 * - run protractor.conf.js from context menu in IntelliJ IDEA
 */

exports.config = {
    allScriptsTimeout: 210000,
    specs: [
        './src/**/*.e2e-spec.ts'
    ],
    capabilities: {
        'browserName': 'chrome',
        chromeOptions: {
            args: [
                '--start-maximized'
                // '--auto-open-devtools-for-tabs'
            ]
        }
    },
    directConnect: true,
    baseUrl: 'https://localhost:4200/',
    framework: 'jasmine',
    jasmineNodeOpts: {
        showColors: true,
        defaultTimeoutInterval: 120000,
        useAllAngular2AppRoots: true,
        print: function () {
        }
    },
    onPrepare() {
        require('ts-node').register({
            project: require('path').join(__dirname, './tsconfig.e2e.json')
        });
        jasmine.getEnv().addReporter(new SpecReporter({spec: {displayStacktrace: true}}));
        // browser.driver.manage().window().maximize();
        browser.sleep(3000)
        browser.waitForAngularEnabled(false)
    }
};

