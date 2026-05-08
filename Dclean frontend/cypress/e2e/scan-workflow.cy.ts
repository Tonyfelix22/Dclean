describe('Scan Workflow', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('should display the dashboard', () => {
    cy.contains('h1', 'Dclean').should('be.visible')
    cy.contains('h2', 'Start New Scan').should('be.visible')
  })

  it('should display rules section', () => {
    cy.contains('h3', 'Select Rules').should('be.visible')
  })

  it('should have navigation menu', () => {
    cy.contains('a', 'Dashboard').should('be.visible')
    cy.contains('a', 'Rules').should('be.visible')
    cy.contains('a', 'History').should('be.visible')
    cy.contains('a', 'Settings').should('be.visible')
  })

  it('should navigate to rules page', () => {
    cy.contains('a', 'Rules').click()
    cy.url().should('include', '/rules')
    cy.contains('h1', 'Cleaning Rules').should('be.visible')
  })

  it('should navigate to history page', () => {
    cy.contains('a', 'History').click()
    cy.url().should('include', '/history')
    cy.contains('h1', 'Job History').should('be.visible')
  })

  it('should navigate to settings page', () => {
    cy.contains('a', 'Settings').click()
    cy.url().should('include', '/settings')
    cy.contains('h1', 'Settings').should('be.visible')
  })
})

describe('Rules Management', () => {
  beforeEach(() => {
    cy.visit('/rules')
  })

  it('should display rules page', () => {
    cy.contains('h1', 'Cleaning Rules').should('be.visible')
  })

  it('should have create rule button', () => {
    cy.contains('button', 'Create New Rule').should('be.visible')
  })

  it('should open rule form when create button is clicked', () => {
    cy.contains('button', 'Create New Rule').click()
    cy.contains('h2', 'Create New Rule').should('be.visible')
  })

  it('should validate required fields in rule form', () => {
    cy.contains('button', 'Create New Rule').click()
    cy.contains('button', 'Create Rule').click()
    // Form should show validation errors
  })

  it('should close rule form when cancel is clicked', () => {
    cy.contains('button', 'Create New Rule').click()
    cy.contains('h2', 'Create New Rule').should('be.visible')
    cy.get('button[aria-label*="close"], button:has-text("Cancel")').first().click()
    cy.contains('h2', 'Create New Rule').should('not.exist')
  })
})

describe('Settings Page', () => {
  beforeEach(() => {
    cy.visit('/settings')
  })

  it('should display settings page', () => {
    cy.contains('h1', 'Settings').should('be.visible')
  })

  it('should have account section', () => {
    cy.contains('h2', 'Account').should('be.visible')
  })

  it('should have appearance section', () => {
    cy.contains('h2', 'Appearance').should('be.visible')
  })

  it('should have behavior section', () => {
    cy.contains('h2', 'Behavior').should('be.visible')
  })

  it('should have about section', () => {
    cy.contains('h2', 'About').should('be.visible')
  })

  it('should have save preferences button', () => {
    cy.contains('button', 'Save Preferences').should('be.visible')
  })

  it('should toggle checkboxes', () => {
    cy.get('#auto-confirm').click()
    cy.get('#auto-confirm').should('be.checked')
    cy.get('#auto-confirm').click()
    cy.get('#auto-confirm').should('not.be.checked')
  })
})
