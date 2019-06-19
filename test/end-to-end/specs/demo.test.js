describe("demo test", function() {
  it("demo test", function() {
    browser.login();
    browser.switchToComposerFrame();
    browser.waitForBlueprintsPageLoaded();
    browser.pause(2000);
  });
});
