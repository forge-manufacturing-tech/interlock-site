
describe('Workflow Navigation', () => {
    const password = 'TestPassword123!'
    const projectName = 'Workflow Test Project'
    const sessionTitle = 'Workflow Navigation Session'

    beforeEach(() => {
        cy.viewport(1280, 720)

        // Mock Auth
        const createToken = (payload: any) => {
            const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
            const body = btoa(JSON.stringify(payload));
            return `${header}.${body}.signature`;
        };
        const validToken = createToken({ email: 'test@example.com', name: 'Test User', role: 'user', sub: 'user-pid' });

        cy.intercept('POST', '**/api/auth/login', {
            statusCode: 200,
            body: { token: validToken, name: 'Test User' }
        }).as('login')

        // Mock Projects
        cy.intercept('GET', '**/api/projects', {
            statusCode: 200,
            body: [{ id: 'mock-project-id', name: projectName }]
        }).as('getProjects')

        cy.intercept('GET', '**/api/projects/*', {
            statusCode: 200,
            body: { id: 'mock-project-id', name: projectName }
        }).as('getProject')

        // Mock Sessions List
        cy.intercept('GET', '**/api/sessions*', {
            statusCode: 200,
            body: [{
                id: 'mock-session-id',
                title: sessionTitle,
                content: JSON.stringify({
                    workflow_stage: 'ingestion',
                    lifecycle: { steps: ['Phase 1', 'Phase 2', 'Phase 3'], currentStep: 0 }
                })
            }]
        }).as('getSessions')

        // Mock Initial Session Data (Ingestion Stage)
        const initialContent = JSON.stringify({
            workflow_stage: 'ingestion',
            lifecycle: { steps: ['Phase 1', 'Phase 2', 'Phase 3'], currentStep: 0 }
        })

        cy.intercept('GET', '**/api/sessions/mock-session-id', {
            statusCode: 200,
            body: { id: 'mock-session-id', title: sessionTitle, status: 'completed', content: initialContent }
        }).as('getSessionIngestion')

        // Mock Update Session
        cy.intercept('PUT', '**/api/sessions/mock-session-id', (req) => {
            req.reply({
                statusCode: 200,
                body: { ...req.body, id: 'mock-session-id' }
            })
        }).as('updateSession')

        // Mock Blobs - Default empty
        cy.intercept('GET', '**/api/blobs*', {
            statusCode: 200,
            body: []
        }).as('getBlobs')

        // Mock Chat
        cy.intercept('GET', '**/api/chat/messages*', {
            statusCode: 200,
            body: []
        })

        // Login and Navigate
        cy.visit('/login')
        cy.get('input[type="email"]').type('test@example.com')
        cy.get('input[type="password"]').type(password)
        cy.get('button[type="submit"]').click()

        cy.contains(projectName).click()
        cy.contains(sessionTitle).click()
    })

    it('should allow navigation between Ingestion, Preparation, and Verification', () => {
        // 1. Start at Ingestion
        cy.contains('PROCEED TO PREPARATION').should('be.visible')

        // Mock switch to Preparation
        cy.intercept('GET', '**/api/sessions/mock-session-id', {
            statusCode: 200,
            body: {
                id: 'mock-session-id',
                title: sessionTitle,
                status: 'completed',
                content: JSON.stringify({
                    workflow_stage: 'preparation',
                    lifecycle: { steps: ['Phase 1', 'Phase 2', 'Phase 3'], currentStep: 0 }
                })
            }
        }).as('getSessionPrep')

        // Click Proceed
        cy.contains('PROCEED TO PREPARATION').click()
        cy.wait('@updateSession')

        // 2. Verify Preparation Stage
        cy.contains('Preparation Station').should('be.visible')

        // Mock Generation Start
        cy.intercept('POST', '**/api/sessions/mock-session-id/queue', {
            statusCode: 200,
            body: { message: "Queued" }
        }).as('queueMetadata')

        // Mock Polling - Session Completed
        cy.intercept('GET', '**/api/sessions/mock-session-id', {
            statusCode: 200,
            body: {
                id: 'mock-session-id',
                title: sessionTitle,
                status: 'completed', // Completed stops polling
                content: JSON.stringify({
                    workflow_stage: 'preparation',
                    lifecycle: { steps: ['Phase 1', 'Phase 2', 'Phase 3'], currentStep: 0 }
                })
            }
        }).as('getSessionPolling')

        // Mock Blobs with Metadata (happens during polling)
        cy.intercept('GET', '**/api/sessions/mock-session-id/blobs', {
            statusCode: 200,
            body: [{
                id: 'meta-blob',
                session_id: 'mock-session-id',
                file_name: 'metadata.json',
                content_type: 'application/json',
                size: 100,
                created_at: new Date().toISOString()
            }]
        }).as('getBlobsWithMeta')

        cy.intercept('GET', '**/api/blobs/meta-blob/download', {
            statusCode: 200,
            body: { product_definition: {} }
        }).as('getMetadata')

        // Click Initialize
        cy.contains('Initialize Metadata Analysis').click()

        // Wait for polling/blobs to update UI
        cy.wait('@queueMetadata')
        // The polling loop waits 2s? We can force wait.
        cy.wait(2500)

        // Check enabled button
        cy.contains('PROCEED TO VERIFICATION').should('be.visible').and('not.be.disabled')

        // Mock switch to Verification
        cy.intercept('GET', '**/api/sessions/mock-session-id', {
            statusCode: 200,
            body: {
                id: 'mock-session-id',
                title: sessionTitle,
                status: 'completed',
                content: JSON.stringify({
                    workflow_stage: 'verification',
                    lifecycle: { steps: ['Phase 1', 'Phase 2', 'Phase 3'], currentStep: 0 }
                })
            }
        }).as('getSessionVerification')

        // Click Proceed
        cy.contains('PROCEED TO VERIFICATION').click()
        cy.wait('@updateSession')

        // 3. Verify Verification Stage
        cy.contains('Verification Station').should('be.visible')
        cy.contains('Back to Ingestion').should('be.visible')

        // Mock switch back to Ingestion
        cy.intercept('GET', '**/api/sessions/mock-session-id', {
            statusCode: 200,
            body: {
                id: 'mock-session-id',
                title: sessionTitle,
                status: 'completed',
                content: JSON.stringify({
                    workflow_stage: 'ingestion',
                    lifecycle: { steps: ['Phase 1', 'Phase 2', 'Phase 3'], currentStep: 0 }
                })
            }
        }).as('getSessionIngestionAgain')

        // Click Back
        cy.contains('Back to Ingestion').click()
        cy.wait('@updateSession')

        // 4. Verify Ingestion
        cy.contains('PROCEED TO PREPARATION').should('be.visible')
    })
})
