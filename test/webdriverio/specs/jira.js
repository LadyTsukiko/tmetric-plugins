describe("Jira", function () {

  var testProjectName = 'Demo';

  var testIssueName = 'Issue-qweasdzxc for Demo';
  var testIssueSearchUrl = 'https://jira.atlassian.com/projects/DEMO/issues?filter=reportedbyme';
  var testIssueUrl = '';

  var testFilterName = 'Filter-qweasdzxc for Demo';
  var testFilterSearchUrl = 'https://jira.atlassian.com/secure/ManageFilters.jspa#filterView=my';

  var testBoardSearchUrl = 'https://jira.atlassian.com/secure/ManageRapidViews.jspa';

  var testKanbanBoardName = 'Board-Kanban-qweasdzxc for Demo';
  var testKanbanBoardUrl = '';

  before(function () {

    var testIssueAnchorSelector = '//a[span[contains(@class,"issue-link-summary")][text()="' + testIssueName + '"]]';
    var testKanbanBoardAnchorSelector = '//a[text()="' + testKanbanBoardName + '"]';

    function createIssue () {
      return browser
        .url(testIssueSearchUrl)
        .waitForExist('#create_link')
        .click('#create_link')
        .waitForExist('#create-issue-submit')
        .setValue('#summary', testIssueName)
        .click('#create-issue-submit')
        .waitForExist('#create-issue-dialog', 30000, true)
        .url(testIssueSearchUrl)
        .waitForExist(testIssueAnchorSelector)
        .getAttribute(testIssueAnchorSelector, 'href')
        .then(function (result) {
          testIssueUrl = result;
        });
    }

    function createFilter () {
      return browser
        .url(testIssueSearchUrl)
        .waitForExist('#full-issue-navigator a')
        .click('#full-issue-navigator a')
        .waitForExist('.save-as-new-filter')
        .click('.save-as-new-filter')
        .waitForExist('#filterName')
        .setValue('#filterName', testFilterName)
        .click('.submit')
        .waitForExist('.search-title=' + testFilterName);
    }

    function createKanbanBoard () {
      return browser
        .url(testBoardSearchUrl)
        .waitForExist('#ghx-create-boards-btn')
        .click('#ghx-create-boards-btn')
        .waitForExist('#ghx-wizard-methodology-kanban')
        .click('#ghx-wizard-methodology-kanban')
        .waitForExist('#ghx-wizard-method-existing-filter')
        .click('#ghx-wizard-method-existing-filter')
        .click('.js-wizard-button-next')
        .waitForExist('#ghx-wizard-filter-view-name')
        .setValue('#ghx-wizard-filter-view-name', testKanbanBoardName)
        .setValue('#ghx-wizard-filter-select-field', testFilterName)
        .waitForExist('//div[label[text()="Saved filter"]]//input[@aria-expanded="true"]')
        .keys('\uE007')
        .waitForExist('//button[@aria-disabled="false"]')
        .click('//button[@aria-disabled="false"]')
        .waitForExist('//div[contains(@class,"project-title")]/a[text()="' + testProjectName + '"]')
        .getAttribute('//a[contains(@data-link-id,"project-sidebar-work-kanban")]', 'href')
        .then(function (result) {
          testKanbanBoardUrl = result;
        });
    }

    return browser
      .login("Jira")
      // check test issue
      .url(testIssueSearchUrl)
      .waitForVisible('.details-layout')
      .isVisible('empty-results')
      .then(function (result) {
        return result ?
          createIssue() :
          browser
            .waitForVisible('.issue-list')
            .isExisting(testIssueAnchorSelector)
            .then(function (result) {
              return result ?
                browser
                  .getAttribute(testIssueAnchorSelector, 'href')
                  .then(function (result) {
                    testIssueUrl = result;
                  }) :
                createIssue();
            });
      })
      .then(function () {
        expect(testIssueUrl).to.be.a('string').and.not.to.be.empty;
      })
      // check test filter
      .url(testFilterSearchUrl)
      .waitForVisible('#mf_owned')
      .isExisting('//a[text()="' + testFilterName + '"]')
      .then(function (result) {
        if (!result) {
          return createFilter();
        }
      })
      // check test kanban board
      .url(testBoardSearchUrl)
      .waitForExist('a[data-item-id="all"]')
      .click('a[data-item-id="all"]')
      .waitForVisible('.js-search-boards-input')
      .setValue('.js-search-boards-input', testKanbanBoardName)
      .isExisting('//a[text()="' + testKanbanBoardName + '"]')
      .then(function (result) {
        return result ?
          browser
            .getAttribute(testKanbanBoardAnchorSelector, 'href')
            .then(function (result) {
              testKanbanBoardUrl = result;
            }) :
          createKanbanBoard();
      })
      .then(function () {
        expect(testKanbanBoardUrl).to.be.a('string').and.not.to.be.empty;
      })

  });

  it("can start timer on an issue", function () {
    return browser
      .url(testIssueUrl)
      .waitForExist('.devart-timer-link')
      .getText('#project-name-val').should.eventually.be.equal(testProjectName)
      .getText('#summary-val').should.eventually.be.equal(testIssueName)
      .url().should.eventually.has.property('value', testIssueUrl)
      .startAndTestTaskStarted(testProjectName, testIssueName, testIssueUrl);
  });

  it("can stop timer on an issue", function () {
    return browser
      .url(testIssueUrl)
      .startStopAndTestTaskStopped();
  });

  it("can start timer on an issue from kanban board", function () {
    return browser
      .url(testKanbanBoardUrl)
      .waitForVisible('.ghx-inner=' + testIssueName)
      .click('.ghx-inner=' + testIssueName)
      .waitForVisible('.ghx-detail-view-blanket', 5000, true)
      .waitForVisible('.devart-timer-link.devart-timer-link-start')
      .getText('.ghx-project').should.eventually.be.equal(testProjectName)
      .getText('dd[data-field-id=summary]').should.eventually.be.equal(testIssueName)
      .getAttribute('dd[data-field-id=issuekey] > a', 'href').should.eventually.be.equal(testIssueUrl)
      .startAndTestTaskStarted(testProjectName, testIssueName, testIssueUrl);
  });

  it("can stop timer on an issue from kanban board", function () {
    return browser
      .url(testKanbanBoardUrl)
      .waitForVisible('.ghx-inner=' + testIssueName)
      .click('.ghx-inner=' + testIssueName)
      .waitForVisible('.ghx-detail-view-blanket', 5000, true)
      .startStopAndTestTaskStopped();
  });

}); 
