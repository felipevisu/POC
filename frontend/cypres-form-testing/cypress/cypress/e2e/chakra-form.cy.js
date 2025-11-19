describe("template spec", () => {
  beforeEach(() => {
    cy.visit("http://localhost:5173/chakra");
  });

  it("specific code", () => {
    // Personal Information
    cy.contains("label", "Full Name").next().type("John Doe");
    cy.contains("label", "Email Address").next().type("john-doe@example.com");
    cy.contains("label", "Phone Number").next().type("+5511987654321");
    cy.contains("label", "LinkedIn Profile").next().type("johndoe");
    cy.contains("label", "Portfolio Website")
      .next()
      .type("https://johndoe.com.br");

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
    cy.get('[aria-label="5 stars"]').first().click({ force: true });

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
    cy.contains("label", "Available Start Date").next().type("2025-12-01");

    // Salary Expectation
    cy.contains("label", "Salary Expectation").next().click("center");

    // Textareas
    cy.contains("label", "Cover Letter").next().type("Nothing to say");
    cy.contains("label", "Key Achievements").next().type("Nothing to say");

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
