describe('Home Page', () => {
    beforeEach(() => {
        cy.visit('/')
    })

    it('should display the home page content', () => {
        // Navbar
        cy.contains('INTERLOCK').should('be.visible')
        cy.contains('GET STARTED').should('be.visible')

        // Hero
        cy.contains('ACCELERATE').should('be.visible')
        cy.contains('TECH TRANSFER').should('be.visible')

        // Features
        cy.contains('How It Works').should('be.visible')
        cy.contains('Ingest').should('be.visible')

        // Team
        cy.contains('Founding Team').should('be.visible')

        // CTA
        cy.contains('Ready to sync?').should('be.visible')
    })

    it('should navigate to login page', () => {
        cy.contains('LOG IN').click()
        cy.url().should('include', '/login')
    })
})
