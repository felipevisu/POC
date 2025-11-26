# Job Application Form - Multi-Framework Testing POC

A Proof of Concept exploring how to write maintainable Cypress tests without relying on test IDs or CSS classes.

## The Challenge

I wanted to understand how difficult it is to write robust Cypress tests, so I set myself these constraints:

- **No `data-testid` attributes** - Tests must work with real user-facing elements
- **No CSS class selectors** - Avoid brittle selectors like `.MuiButton-root`
- **Multiple UI frameworks** - Same form built with Material-UI, Chakra UI, and React Bootstrap

The goal: Write tests that are maintainable, readable, and work across different implementations.

## Two Testing Approaches

I wrote two kinds of tests to compare approaches:

### 1. Framework-Specific Tests

Each framework gets its own test file with implementation-specific selectors:

- `material-form.cy.js` - Tests for Material-UI
- `chakra-form.cy.js` - Tests for Chakra UI
- `bootstrap-form.cy.js` - Tests for React Bootstrap

### 2. Framework-Agnostic Tests

A single reusable command (`fillJobApplicationForm()`) that works across all three frameworks by detecting and adapting to different implementations.

**The same test code works for all frameworks:**

```javascript
describe("Form Test", () => {
  beforeEach(() => {
    cy.visit("http://localhost:5173/material"); // or /chakra or /bootstrap
  });

  it("fills and submits form", () => {
    cy.fillJobApplicationForm(); // Works everywhere!
  });
});
```

## Key Insight: Semantic HTML Makes Testing Easier

Using semantic HTML and proper ARIA roles significantly simplifies testing:

**Good Example:**

```html
<!-- Material-UI Autocomplete -->
<input role="combobox" aria-label="Position" />
<ul role="listbox">
  <li role="option">Frontend Engineer</li>
  <li role="option">Backend Engineer</li>
</ul>
```

**Cypress can target this semantically:**

```javascript
cy.get('[role="combobox"]').click();
cy.get('[role="option"]').contains("Frontend Engineer").click();
```

**Benefits:**

- Works across different component libraries
- More accessible for users with disabilities
- Tests read like user interactions
- No need for test-specific attributes

## Framework-Agnostic Patterns

### Pattern 1: Label-Based Selection

Instead of CSS classes, start from visible labels:

```javascript
// Bad: Framework-specific
cy.get(".MuiTextField-root").type("John Doe");

// Good: Framework-agnostic
cy.contains("label", "Full Name").next().type("John Doe");
```

### Pattern 2: Detect and Adapt

Handle different implementations in one command:

```javascript
Cypress.Commands.add("smartSelect", (labelText, optionText) => {
  cy.contains("label", labelText)
    .next()
    .then(($el) => {
      if ($el.is("select")) {
        // Native select (React Bootstrap)
        cy.wrap($el).select(optionText);
      } else {
        // Custom dropdown (Material-UI, Chakra UI)
        cy.wrap($el).click();
        cy.get('[role="option"]').contains(optionText).click();
      }
    });
});
```

### Pattern 3: Multiple Fallback Strategies

For complex components, try multiple approaches:

```javascript
Cypress.Commands.add(
  "setRating",
  { prevSubject: "element" },
  ($subject, value) => {
    cy.wrap($subject).then(($el) => {
      // Try hidden input (react-simple-star-rating)
      let hiddenInput = $el.find('input[type="hidden"]');
      if (hiddenInput.length) {
        // Manipulate value directly
        return;
      }

      // Try radio inputs (Material-UI)
      const radioInputs = $el.find('input[type="radio"]');
      if (radioInputs.length) {
        cy.wrap(radioInputs.last()).click({ force: true });
        return;
      }

      // Fallback: Click SVG stars
      const stars = $el.find("svg");
      if (stars.length) {
        cy.wrap(stars.eq(value - 1)).click();
      }
    });
  }
);
```

## Technologies Used

**Frontend:**

- React 18 with TypeScript
- Vite
- React Router DOM

**UI Frameworks:**

- Material-UI (MUI) at `/material`
- Chakra UI v3 at `/chakra`
- React Bootstrap at `/bootstrap`

**Testing:**

- Cypress 13

## Installation & Running

```bash
# Install frontend dependencies
cd sample-form
npm install
npm run dev

# Install Cypress dependencies
cd cypress
npm install
npx cypress open
```

## What I Learned

### 1. Semantic HTML is a Testing Superpower

Components with proper ARIA roles (`role="listbox"`, `role="option"`, `role="combobox"`) are much easier to test across frameworks.

### 2. Labels Are Better Than Classes

Starting from visible labels makes tests:

- More readable
- Framework-agnostic
- Less brittle to UI changes

### 3. Detection Over Configuration

Instead of separate tests for each framework, write commands that detect the implementation and adapt.

### 4. React Controlled Components Need Special Handling

Range inputs and some custom components need native value manipulation:

```javascript
const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
  window.HTMLInputElement.prototype,
  "value"
).set;
nativeInputValueSetter.call(input, value);
```

### 5. Test IDs Aren't Always Necessary

With semantic HTML and smart selectors, you can write maintainable tests without adding test-specific attributes.

## Challenges Solved

**Material-UI:**

- Custom Autocomplete components
- Rating with radio inputs
- Custom Select dropdowns

**Chakra UI v3:**

- New namespace API (`Slider.Root`, `Rating.Root`)
- Different event handlers (`onCheckedChange` vs `onChange`)
- Custom implementations without semantic roles

**React Bootstrap:**

- Mixing native elements with custom components
- Form.Range controlled component behavior
- Integration with third-party libraries (react-simple-star-rating)

## Conclusion

Writing tests without test IDs or classes is not only possible but can lead to better tests. The key is leveraging semantic HTML, ARIA roles, and visible labels. The extra effort to make tests framework-agnostic pays off in maintainability and readability.

**The trade-off:** More complex custom commands vs simpler tests with test IDs. For this POC, the semantic approach won because it encourages better accessibility practices and creates more resilient tests.

---

**Built as a learning exercise in maintainable E2E testing**
