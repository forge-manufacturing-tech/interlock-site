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

        // Mock Session
        cy.intercept('GET', '**/api/sessions/mock-session-id', {
            statusCode: 200,
            body: {
                id: 'mock-session-id',
                title: sessionTitle,
                status: 'pending',
                content: JSON.stringify({ workflow_stage: 'ingestion' })
            }
        }).as('getSession')

        // Mock Update Session
        cy.intercept('PUT', '**/api/sessions/mock-session-id', (req) => {
            req.reply({
                statusCode: 200,
                body: { ...req.body, id: 'mock-session-id' }
            })
        }).as('updateSession')

        // Mock Blobs
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

        cy.intercept('GET', '**/api/blobs/blob-1/download*', {
            statusCode: 200,
            body: 'pdf content'
        })

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

    it('should navigate to preparation and allow metadata initialization', () => {
        // 1. Ingestion Stage
        cy.contains('PROCEED TO PREPARATION').click()

        // Mock session update to preparation
        cy.intercept('GET', '**/api/sessions/mock-session-id', {
            statusCode: 200,
            body: {
                id: 'mock-session-id',
                title: sessionTitle,
                status: 'pending',
                content: JSON.stringify({ workflow_stage: 'preparation' })
            }
        }).as('getSessionPrep')

        cy.wait('@updateSession')

        // 2. Preparation Stage
        cy.contains('Preparation Station').should('be.visible')
        cy.contains('Core Metadata Definition').should('be.visible')
        cy.contains('Metadata Not Initialized').should('be.visible')

        // Mock Queue
        cy.intercept('POST', '**/api/sessions/mock-session-id/queue', {
            statusCode: 200,
            body: { message: 'Tasks queued' }
        }).as('queueTasks')

        // Click Initialize
        const initBtn = cy.contains('button', 'Initialize Metadata Analysis')
        initBtn.click()

        // Verify Processing State
        cy.contains('Initializing Metadata Analysis...').should('be.visible')
        cy.wait('@queueTasks')

        // Simulate Metadata Creation via Polling
        const metadata = {
            product_definition: { description: "Generated Desc", specifications: {} },
            bom_summary: { total_parts: 10, critical_items: [] },
            risk_assessment: { issues: [] }
        }

        // Mock completed session with metadata
        cy.intercept('GET', '**/api/sessions/mock-session-id', {
            statusCode: 200,
            body: {
                id: 'mock-session-id',
                title: sessionTitle,
                status: 'completed',
                content: JSON.stringify({ workflow_stage: 'preparation' })
            }
        }).as('getSessionCompleted')

        cy.intercept('GET', '**/api/sessions/mock-session-id/blobs', {
            statusCode: 200,
            body: [{
                id: 'meta-blob-1',
                session_id: 'mock-session-id',
                file_name: 'metadata.json',
                content_type: 'application/json',
                size: 100,
                created_at: new Date().toISOString()
            }]
        }).as('getBlobsWithMeta')

        cy.intercept('GET', '**/api/blobs/meta-blob-1/download', {
            statusCode: 200,
            body: metadata
        }).as('getMetadata')

        // The polling logic in component waits 2000ms.
        // Cypress will retry 'contains' for 4000ms by default.
        // We might need to wait for the polling to hit.
        cy.wait(2500)

        // Verify Metadata Editor appears
        cy.contains('Product Definition').should('be.visible')
        cy.contains('Generated Desc').should('be.visible')

        // Verify Re-Generate button
        cy.contains('button', 'Re-Generate Metadata').should('be.visible')
    })
})
