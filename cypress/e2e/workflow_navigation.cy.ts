
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

        // Mock Initial Session Data (Ingestion Stage, with lifecycle so we can proceed)
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

        // Mock Blobs
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

    it('should allow navigation between Ingestion and Verification, and progress in Completed stage', () => {
        // 1. Start at Ingestion
        cy.contains('PROCEED TO VERIFICATION').should('be.visible')

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

        // 2. Verify we are in Verification
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

        // 3. Verify we are back in Ingestion
        cy.contains('PROCEED TO VERIFICATION').should('be.visible')

        // Mock switch to Complete
        cy.intercept('GET', '**/api/sessions/mock-session-id', {
            statusCode: 200,
            body: {
                id: 'mock-session-id',
                title: sessionTitle,
                status: 'completed',
                content: JSON.stringify({
                    workflow_stage: 'complete',
                    lifecycle: { steps: ['Phase 1', 'Phase 2', 'Phase 3'], currentStep: 0 }
                })
            }
        }).as('getSessionComplete')

        // Go to Verification -> Final Approval
        // Note: we need to re-mock Verification state first if we want to simulate the flow properly,
        // but typically the UI updates optimistically, so we might just need to click through.
        // Let's force the state for the test simplicity or just assume we are there.
        // Actually, we are "visually" in Ingestion now.

        // To save time/complexity, let's just jump to Complete state via mock update for the next click
        // But we need to click "PROCEED TO VERIFICATION" first to see the next button.

        // Manually trigger the flow:
        // Click Proceed again
        cy.contains('PROCEED TO VERIFICATION').click()

        // Click Final Approval
        cy.contains('FINAL APPROVAL').click()
        cy.wait('@updateSession')

        // 4. Verify Completed State
        cy.contains('PRODUCTION READY').should('be.visible')

        // 5. Test Lifecycle Arrows
        cy.contains('Current Phase').should('be.visible')
        // Check for presence of navigation controls
        cy.contains('←').should('exist')
        cy.contains('→').should('exist')

        // Mock step update (Step 0 -> Step 1)
        cy.intercept('PUT', '**/api/sessions/mock-session-id', (req) => {
            const body = JSON.parse(req.body.content)
            expect(body.lifecycle.currentStep).to.eq(1)
            req.reply({ statusCode: 200, body: req.body })
        }).as('updateStepNext')

        // Click Next Arrow (→)
        cy.contains('h4', 'Current Phase').next().find('button').contains('→').click()
        cy.wait('@updateStepNext')

        // Mock return of updated state (Step 1)
        cy.intercept('GET', '**/api/sessions/mock-session-id', {
            statusCode: 200,
            body: {
                id: 'mock-session-id',
                title: sessionTitle,
                status: 'completed',
                content: JSON.stringify({
                    workflow_stage: 'complete',
                    lifecycle: { steps: ['Phase 1', 'Phase 2', 'Phase 3'], currentStep: 1 }
                })
            }
        }).as('getSessionStep1')

        // Check for Phase 2
        cy.contains('Phase 2').should('be.visible')

        // Click Previous Arrow (←)
        cy.contains('Current Phase').parent().find('button').contains('←').click()
        cy.contains('Phase 1').should('be.visible')
    })
})
