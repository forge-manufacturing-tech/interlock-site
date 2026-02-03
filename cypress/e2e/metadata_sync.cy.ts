describe('Metadata Sync Feature', () => {
    const password = 'TestPassword123!'
    const projectName = `Metadata Project ${Date.now()}`
    const sessionTitle = `Metadata Session ${Date.now()}`

    beforeEach(() => {
        cy.viewport(1280, 720)
        const email = `test-metadata-${Date.now()}@example.com`

        const createToken = (payload: any) => {
            const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
            const body = btoa(JSON.stringify(payload));
            return `${header}.${body}.signature`;
        };
        const validToken = createToken({ email: 'test@example.com', name: 'Test User', role: 'user', sub: 'user-pid' });

        // Mocks
        cy.intercept('POST', '**/api/auth/register', {
            statusCode: 200,
            body: { token: validToken, name: 'Test User' }
        }).as('register')

        cy.intercept('POST', '**/api/auth/login', {
            statusCode: 200,
            body: { token: validToken, name: 'Test User' }
        }).as('login')

        cy.intercept('GET', '**/api/projects', {
            statusCode: 200,
            body: [{ id: 'mock-project-id', name: projectName }]
        }).as('getProjects')

        cy.intercept('GET', '**/api/projects/*', {
            statusCode: 200,
            body: { id: 'mock-project-id', name: projectName }
        }).as('getProject')

        cy.intercept('GET', '**/api/sessions*', {
            statusCode: 200,
            body: [{ id: 'mock-session-id', title: sessionTitle, project_id: 'mock-project-id' }]
        }).as('getSessions')

        cy.intercept('GET', '**/api/sessions/mock-session-id', {
            statusCode: 200,
            body: { id: 'mock-session-id', title: sessionTitle, status: 'pending', content: '{}' }
        }).as('getSession')

        // Mock Blobs - need at least one to trigger ingestion workbench (or wizardStep != 1)
        // But the code logic is: (blobs.length === 0 && wizardStep === 1) ? renderEmptyState : renderIngestionWorkbench
        // So we need a blob.
        cy.intercept('GET', '**/api/sessions/mock-session-id/blobs', {
            statusCode: 200,
            body: [{
                id: 'blob-1',
                session_id: 'mock-session-id',
                file_name: 'test.pdf',
                content_type: 'application/pdf',
                size: 100,
                created_at: new Date().toISOString()
            }]
        }).as('getBlobs')

        // Mock download for the blob
         cy.intercept('GET', '**/api/blobs/blob-1/download*', {
            statusCode: 200,
            body: 'pdf content'
        })

        // Mock Chat for Sync
        cy.intercept('POST', '**/api/sessions/mock-session-id/chat', {
            statusCode: 200,
            body: { role: 'assistant', content: 'Metadata updated' },
            delay: 1000
        }).as('chatSync')

        // Login and Navigate
        cy.visit('/login')
        cy.contains("Create New Account").click()
        cy.get('input[type="text"]').type('Test User')
        cy.get('input[type="email"]').type(email)
        cy.get('input[type="password"]').type(password)
        cy.get('button[type="submit"]').click()

        cy.contains(projectName).click()
        cy.contains(sessionTitle).click()
    })

    it('should display Core Metadata panel and allow syncing', () => {
        // Verify Panel Exists
        cy.contains('Core Metadata').should('be.visible')
        cy.contains('No metadata initialized').should('be.visible')

        // Verify Button
        const syncBtn = cy.contains('button', 'Sync Metadata')
        syncBtn.should('be.visible')

        // Click Sync
        syncBtn.click()

        // Verify Button State Changes
        cy.contains('button', 'Syncing...').should('be.visible').and('be.disabled')

        // Verify API Call
        cy.wait('@chatSync').then((interception) => {
            expect(interception.request.body.message).to.include('[SYSTEM: METADATA_SYNC]')
        })

        // Verify Blobs Refetch (which would load new metadata.json if it existed)
        cy.wait('@getBlobs')

        // Button should revert
        cy.contains('button', 'Sync Metadata').should('be.visible')
    })
})
