describe("template spec", () => {
  it("passes", () => {
    cy.visit("http://localhost:5173/");

    cy.get('input[name="fullname"]').type("John Doe");
    cy.get('input[name="email"]').type("john-doe@example.com");
    cy.get('input[name="phone"]').type("+5511987654321");
    cy.get('input[name="linkedin"]').type("johndoe");
    cy.get('input[name="portfolio"]').type("https://johndoe.com.br");

    cy.get('input[name="position"]').parent().click();
    cy.get('[role="option"]').contains("Frontend Engineer").click();

    cy.get('input[name="department"]').parent().click();
    cy.get('[role="option"]').contains("Engineering").click();

    cy.get('input[name="experience"]').parent().click();
    cy.get('[role="option"]').contains("Junior").click();

    cy.get('input[name="skills"]').parent().click();
    cy.get('[role="option"]').contains("JavaScript").click();
    cy.get('[role="option"]').contains("React").click();
    cy.get("body").click(0, 0);

    cy.get('input[name="locations"]').type("New York", { force: true });
    cy.get('[role="listbox"]').contains("New York").click();

    cy.get('input[name="locations"]').type("Los Angeles", { force: true });
    cy.get('[role="listbox"]').contains("Los Angeles").click();
  });
});
