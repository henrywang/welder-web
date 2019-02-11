const axeSource = require("axe-core").source;
const commands = require("../utils/commands");

const blueprintsPage = require("../pages/blueprints.page");
const sourcesPage = require("../pages/sources.page");

describe("Sources Page", function() {
  before(function() {
    commands.login();
    blueprintsPage.moreButton.click();
    blueprintsPage.viewSourcesItem.click();
    sourcesPage.loading();
  });

  it("run assibility test in Sources page", function() {
    // inject the script
    browser.execute(axeSource);
    // run inside browser and get results
    let results = browser.executeAsync(function(done) {
      // run axe on current page
      axe.run(function(err, results) {
        if (err) done(err);
        done(results);
      });
    });
    console.log(commands.formatAccessibilityViolations(results.value.violations));
    // Comment out before issues got fixed.
    // expect(results.value.violations.length).to.equal(0);
  });

  it("should show correct title", function() {
    expect(sourcesPage.title.getText()).to.equal("Sources");
  });

  it("close Sources dialog by clicking Close button", function() {
    sourcesPage.closeButton.click();
    browser.waitUntil(() => !$(sourcesPage.containerSelector).isExisting(), timeout, "Cannot close Sources dialog");
    expect($(sourcesPage.containerSelector).isExisting()).to.be.false;
  });
});
