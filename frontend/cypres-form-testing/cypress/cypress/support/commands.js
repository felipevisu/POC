Cypress.Commands.add("fillJobApplicationForm", () => {
  // Personal Information
  cy.get('input[name="fullname"]').type("John Doe");
  cy.get('input[name="email"]').type("john-doe@example.com");
  cy.get('input[name="phone"]').type("+5511987654321");
  cy.get('input[name="linkedin"]').type("johndoe");
  cy.get('input[name="portfolio"]').type("https://johndoe.com.br");

  // Position Applying For
  cy.contains("label", "Position Applying For").next().click();
  cy.get('[role="option"]').contains("Frontend Engineer").click();

  // Department
  cy.contains("label", "Department").next().click();
  cy.get('[role="option"]').contains("Engineering").click();

  // Experience Level
  cy.contains("label", "Experience Level").next().click();
  cy.get('[role="option"]').contains("Junior").click();

  // Technical Skills
  cy.contains("label", "Technical Skills").next().click();
  cy.get('[role="option"]').contains("JavaScript").click();
  cy.get("body").click(0, 0);
  cy.contains("label", "Technical Skills").next().click();
  cy.get('[role="option"]').contains("React").click();
  cy.get("body").click(0, 0);

  // Preferred Locations
  cy.get('input[name="preferredLocations"]').type("New York", {
    force: true,
  });
  cy.get('[role="option"]').contains("New York").click();
  cy.get('input[name="preferredLocations"]').type("Los Angeles", {
    force: true,
  });
  cy.get('[role="option"]').contains("Los Angeles").click();

  // Years of Experience
  cy.contains("label", "Years of Experience").next().click("center");

  // Rating
  cy.get('[aria-label="5 stars"], span:contains("5 Stars")')
    .first()
    .click({ force: true });

  // Employment Type
  cy.contains("label", "Full-Time").click();

  // Work Preferences
  cy.contains("label", "Remote Work").click();
  cy.contains("label", "Hybrid").click();

  // Benefits
  cy.contains("label", "Health Insurance").click();
  cy.contains("label", "Dental Insurance").click();

  // Relocation
  cy.contains("label", "Maybe, depends on location").click();

  // Switches
  cy.contains("Available for Immediate Start").prev().click();
  cy.contains("Were you referred by an employee?").prev().click();

  // Available Start Date
  cy.get('input[name="availableFrom"]').type("2025-12-01");

  // Salary Expectation
  cy.contains("label", "Salary Expectation").next().click("center");

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
