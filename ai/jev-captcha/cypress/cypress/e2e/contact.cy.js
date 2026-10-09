describe("contact form", () => {
  it("tries to submit", () => {
    cy.visit("/");
    cy.get("input[name=name]").type("Ada Lovelace");
    cy.get("input[name=email]").type("ada@example.com");
    cy.get("select[name=subject]").select("Support");
    cy.get("textarea[name=message]").type("Hello from Cypress");
    cy.contains("button", "Send").click();
    // Jev decides; the test fails when the submit was blocked as a bot.
    cy.get("[role=status], [role=alert]", { timeout: 10000 }).then(($el) => {
      expect($el.attr("role"), `bot detected: ${$el.text()}`).to.equal("status");
    });
  });
});
