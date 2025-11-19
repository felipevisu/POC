describe("template spec", () => {
  beforeEach(() => {
    cy.visit("http://localhost:5173/material");
  });

  it("specific code", () => {
    // Personal Information
    cy.get('input[name="fullname"]').type("John Doe");
    cy.get('input[name="email"]').type("john-doe@example.com");
    cy.get('input[name="phone"]').type("+5511987654321");
    cy.get('input[name="linkedin"]').type("johndoe");
    cy.get('input[name="portfolio"]').type("https://johndoe.com.br");

    // Position Applying For
    cy.get('input[name="position"]').parent().click();
    cy.get('[role="option"]').contains("Frontend Engineer").click();

    // Department
    cy.get('input[name="department"]').parent().click();
    cy.get('[role="option"]').contains("Engineering").click();

    // Experience Level
    cy.get('input[name="experienceLevel"]').parent().click();
    cy.get('[role="option"]').contains("Junior").click();

    // Technical Skills
    cy.get('input[name="skills"]').parent().click();
    cy.get('[role="option"]').contains("JavaScript").click();
    cy.get('[role="option"]').contains("React").click();
    cy.get("body").click(0, 0);

    // Preferred Locations
    cy.get('input[name="preferredLocations"]').type("New York", {
      force: true,
    });
    cy.get('[role="listbox"]').contains("New York").click();
    cy.get('input[name="preferredLocations"]').type("Los Angeles", {
      force: true,
    });
    cy.get('[role="listbox"]').contains("Los Angeles").click();

    // Years of Experience
    cy.get('input[name="yearsExperience"]').parent().parent().click("center");

    // Rating
    cy.get('input[name="rate"][value="5"]')
      .invoke("attr", "id")
      .then((id) => {
        cy.get(`label[for="${id}"]`).click();
      });

    // Employment Type
    cy.get('input[value="fulltime"]').click();

    // Work Preferences
    cy.get('input[value="remote"]').click();
    cy.get('input[value="hybrid"]').click();

    // Benefits
    cy.get('input[value="Health Insurance"]').click();
    cy.get('input[value="Dental Insurance"]').click();

    // Relocation
    cy.get('input[value="maybe"]').click();

    // Switches
    cy.get('input[name="immediateStart"]').click();
    cy.get('input[name="referral"]').click();

    // Available Start Date
    cy.get('input[name="availableFrom"]').type("2025-12-01");

    // Salary Expectation
    cy.get('input[name="salaryExpectation"]').parent().parent().click("center");

    // Textareas
    cy.get('textarea[name="coverLetter"]').type("Nothing to say");
    cy.get('textarea[name="achievements"]').type("Nothing to say");

    // Submit
    cy.get("button").contains("Submit Application").click();

    // Verify success alert
    cy.get('[role="alert"]')
      .should("be.visible")
      .and("contain", "Application submitted successfully");
  });

  it("generic code", () => {
    cy.fillJobApplicationForm();
  });
});
