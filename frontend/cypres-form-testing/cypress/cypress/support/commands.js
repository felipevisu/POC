Cypress.Commands.add("smartSelect", (labelText, optionText) => {
  // Find label, then the dropdown after it
  cy.contains("label", labelText)
    .next()
    .then(($el) => {
      // Case 1: Native select
      if ($el.is("select")) {
        cy.wrap($el).select(optionText);
      } else {
        cy.wrap($el).click();
        cy.get('[role="option"]').contains(optionText).click();
      }
      cy.get("body").click(0, 0);
    });
});

Cypress.Commands.add(
  "setRating",
  { prevSubject: "element" },
  ($subject, value) => {
    cy.wrap($subject).then(($el) => {
      // Try to find hidden input (Material UI, Bootstrap react-simple-star-rating)
      let hiddenInput = $el.find('input[type="hidden"]');

      if (hiddenInput.length) {
        // Force change the hidden input value
        const input = hiddenInput[0];
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
          window.HTMLInputElement.prototype,
          "value"
        ).set;
        nativeInputValueSetter.call(input, value);

        const inputEvent = new Event("input", { bubbles: true });
        input.dispatchEvent(inputEvent);

        const changeEvent = new Event("change", { bubbles: true });
        input.dispatchEvent(changeEvent);
        return;
      }

      // Fallback: find all radio inputs and click the last one (5 stars)
      const radioInputs = $el.find('input[type="radio"]');
      if (radioInputs.length) {
        cy.wrap(radioInputs.last()).click({ force: true });
        return;
      }

      // If no inputs found, try clicking SVG stars (for custom implementations)
      const stars = $el.find("svg.star-svg");
      if (stars.length) {
        // Click the star at the index based on value (value-1 because 0-indexed)
        cy.wrap(stars.eq(value - 1)).click({ force: true });
      }
    });
  }
);

Cypress.Commands.add("toggleSwitch", (labelText) => {
  // 1. Find the element containing the label text
  cy.contains(labelText).then(($labelText) => {
    const $parent = $labelText.parent();

    // --- Case 1: Material UI: label wraps the text ---
    if ($parent.is("label")) {
      cy.wrap($parent).find('input[type="checkbox"]').click({ force: true });
      return;
    }

    // --- Case 2: Chakra UI: label is previous sibling ---
    const $prev = $labelText.prev("label");
    if ($prev.length) {
      cy.wrap($prev).find('input[type="checkbox"]').click({ force: true });
      return;
    }

    // Fallback: try to find ANY checkbox inside parent tree
    cy.wrap($parent).find('input[type="checkbox"]').click({ force: true });
  });
});

Cypress.Commands.add(
  "setRangeValue",
  { prevSubject: "element" },
  ($subject, value) => {
    cy.wrap($subject).then(($el) => {
      // Check if the element itself is an input[type="range"]
      let range;
      if ($el.is("input")) {
        range = $el[0];
      } else {
        // If not, find the input[type="range"] inside it
        range = $el.find("input")[0];
      }

      if (!range) {
        return cy.wrap($el).click({ position: "center", force: true });
      }

      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        "value"
      ).set;
      nativeInputValueSetter.call(range, value);

      const inputEvent = new Event("input", { bubbles: true });
      range.dispatchEvent(inputEvent);

      const changeEvent = new Event("change", { bubbles: true });
      range.dispatchEvent(changeEvent);
    });
  }
);

Cypress.Commands.add("fillJobApplicationForm", () => {
  // Personal Information
  cy.contains("label", "Full Name").next().type("John Doe");
  cy.contains("label", "Email Address").next().type("john-doe@example.com");
  cy.contains("label", "Phone Number").next().type("+5511987654321");
  cy.contains("label", "LinkedIn Profile").next().type("johndoe");
  cy.contains("label", "Portfolio Website")
    .next()
    .type("https://johndoe.com.br");

  // Position Applying For
  cy.smartSelect("Position Applying For", "Frontend Engineer");

  // Department
  cy.smartSelect("Department", "Engineering");

  // Experience Level
  cy.smartSelect("Experience Level", "Junior (0-2 years)");

  // Technical Skills
  cy.smartSelect("Technical Skills", "JavaScript");
  cy.smartSelect("Technical Skills", "React");

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
  cy.contains("label", "Years of Experience").next().setRangeValue(10);

  // Rating
  cy.get('[aria-label="5 stars"], span:contains("5 Stars"), svg.star-svg')
    .last()
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
  cy.toggleSwitch("Available for Immediate Start");
  cy.toggleSwitch("Were you referred by an employee?");

  // Available Start Date
  cy.contains("label", "Available Start Date").next().type("2025-12-01");

  // Salary Expectation
  cy.contains("label", "Salary Expectation").next().setRangeValue(150000);

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
