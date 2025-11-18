describe("template spec", () => {
  it("passes", () => {
    cy.visit("http://localhost:5173/material");

    cy.get('input[name="fullname"]').type("John Doe");
    cy.get('input[name="email"]').type("john-doe@example.com");
    cy.get('input[name="phone"]').type("+5511987654321");
    cy.get('input[name="linkedin"]').type("johndoe");
    cy.get('input[name="portfolio"]').type("https://johndoe.com.br");

    cy.contains("label", "Position Applying For").next().click();
    cy.get('[role="option"]').contains("Frontend Engineer").click();

    cy.contains("label", "Department").next().click();
    cy.get('[role="option"]').contains("Engineering").click();

    cy.contains("label", "Experience Level").next().click();
    cy.get('[role="option"]').contains("Junior").click();

    cy.contains("label", "Technical Skills").next().click();
    cy.get('[role="option"]').contains("JavaScript").click();
    cy.get('[role="option"]').contains("React").click();
    cy.get("body").click(0, 0);

    cy.get('input[name="preferredLocations"]').type("New York", {
      force: true,
    });
    cy.get('[role="listbox"]').contains("New York").click();
    cy.get('input[name="preferredLocations"]').type("Los Angeles", {
      force: true,
    });
    cy.get('[role="listbox"]').contains("Los Angeles").click();

    cy.get('input[name="yearsExperience"]').parent().parent().click("center");

    cy.get('input[name="rate"][value="5"]')
      .invoke("attr", "id")
      .then((id) => {
        cy.get(`label[for="${id}"]`).click();
      });

    cy.get('input[value="fulltime"]').click();
    cy.get('input[value="remote"]').click();
    cy.get('input[value="hybrid"]').click();

    cy.get('input[value="Health Insurance"]').click();
    cy.get('input[value="Dental Insurance"]').click();

    cy.get('input[value="maybe"]').click();

    cy.get('input[name="immediateStart"]').click();

    cy.get('input[name="referral"]').click();

    cy.get('input[name="availableFrom"]').type("2025-12-01");

    cy.get('input[name="salaryExpectation"]').parent().parent().click("center");

    cy.get('textarea[name="coverLetter"]').type("Nothing to say");

    cy.get('textarea[name="achievements"]').type("Nothing to say");

    cy.get("button").contains("Submit Application").click();

    cy.get('[role="alert"]')
      .should("be.visible")
      .and("contain", "Application submitted successfully");
  });
});
