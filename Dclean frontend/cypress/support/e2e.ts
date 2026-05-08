// Cypress support file for E2E tests

// Hide console errors during tests
const app = window.top

if (app) {
  Object.defineProperty(app, 'CESIUM_BASE_URL', {
    value: '/',
  })
}

// Custom commands
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.visit('/login')
  cy.get('input[type="email"]').type(email)
  cy.get('input[type="password"]').type(password)
  cy.get('button[type="submit"]').click()
  cy.url().should('include', '/dashboard')
})

Cypress.Commands.add('createRule', (ruleName: string, pattern: string) => {
  cy.visit('/rules')
  cy.contains('button', 'Create New Rule').click()
  cy.get('input[placeholder*="Rule Name"]').type(ruleName)
  cy.get('input[placeholder*="pattern"]').type(pattern)
  cy.contains('button', 'Create Rule').click()
  cy.contains(ruleName).should('be.visible')
})

declare global {
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<void>
      createRule(name: string, pattern: string): Chainable<void>
    }
  }
}

export {}
