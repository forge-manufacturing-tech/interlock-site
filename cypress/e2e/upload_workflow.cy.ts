describe('Upload Workflow Queue Trigger', () => {
    const password = 'TestPassword123!'
    let projectName: string

    beforeEach(() => {
        cy.viewport(1280, 720)
        // Register with unique email for this test suite
        const email = `test-upload-${Date.now()}@example.com`
        projectName = `Upload Test Project ${Date.now()}`

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
            body: []
        }).as('getProjects')

        cy.intercept('POST', '**/api/projects', (req) => {
            req.reply({
                statusCode: 200,
                body: { id: 'mock-project-id', name: req.body.name }
            })
        }).as('createProject')

        cy.intercept('GET', '**/api/projects/*', {
            statusCode: 200,
            body: { id: 'mock-project-id', name: projectName }
        }).as('getProject')

        cy.intercept('GET', '**/api/sessions*', {
            statusCode: 200,
            body: []
        }).as('getSessions')

        cy.intercept('GET', '**/api/chat/messages*', {
            statusCode: 200,
            body: []
        }).as('getMessages')

        // Setup: Register, login, and create a project
        cy.visit('/login')
        cy.contains("Create New Account").click()
        cy.get('input[type="text"]').type('Test User')
        cy.get('input[type="email"]').type(email)
        cy.get('input[type="password"]').type(password)
        cy.get('button[type="submit"]').click()

        // Wait for redirect
        cy.url({ timeout: 20000 }).should('include', '/dashboard')
        cy.contains('PROJECTS', { timeout: 20000 }).should('be.visible')

        // Mock re-fetch for project list after creation
        cy.intercept('GET', '**/api/projects', {
            statusCode: 200,
            body: [{ id: 'mock-project-id', name: projectName }]
        }).as('getProjectsAfterCreate')

        cy.contains('+ New Project', { timeout: 10000 }).click()
        cy.get('input[type="text"]').first().type(projectName)
        cy.contains('button', 'Create').click()
        cy.contains(projectName, { timeout: 10000 }).click()

        // Wait for sessions page to load
        cy.url({ timeout: 10000 }).should('include', '/projects/')
        cy.contains('TECH TRANSFER SUITE', { timeout: 10000 }).should('be.visible')
    })

    it('should trigger processing queue after BOM upload', () => {
        const sessionTitle = `Upload Queue Test ${Date.now()}`
        const blobId = 'mock-blob-id'

        // Mock Session
        cy.intercept('POST', '**/api/sessions', (req) => {
            req.reply({
                statusCode: 200,
                body: { id: 'mock-session-id', title: req.body.title, project_id: 'mock-project-id' }
            })
        }).as('createSession')

        cy.intercept('GET', '**/api/sessions*', {
            statusCode: 200,
            body: [{ id: 'mock-session-id', title: sessionTitle }]
        }).as('getSessionsAfterCreate')

        cy.intercept('GET', '**/api/sessions/mock-session-id', {
            statusCode: 200,
            body: { id: 'mock-session-id', title: sessionTitle, status: 'pending' }
        })

        // Mock Blobs (empty initially)
        cy.intercept('GET', '**/api/sessions/mock-session-id/blobs', {
            statusCode: 200,
            body: []
        }).as('getBlobsInitial')

        // Mock Upload
        cy.intercept('POST', '**/api/sessions/mock-session-id/blobs', {
            statusCode: 200,
            body: {
                id: blobId,
                session_id: 'mock-session-id',
                file_name: 'test_bom.xlsx',
                content_type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                size: 1024,
                created_at: new Date().toISOString()
            }
        }).as('uploadBlob')

        // Mock Blobs (after upload)
        cy.intercept('GET', '**/api/sessions/mock-session-id/blobs', (req) => {
            req.reply({
                statusCode: 200,
                body: [{
                    id: blobId,
                    session_id: 'mock-session-id',
                    file_name: 'test_bom.xlsx',
                    content_type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    size: 1024,
                    created_at: new Date().toISOString()
                }]
            })
        }).as('getBlobsAfterUpload')

        // Mock Queue trigger - THIS IS WHAT WE WANT TO VERIFY
        cy.intercept('POST', '**/api/sessions/mock-session-id/queue', {
            statusCode: 200,
            body: { status: 'queued' }
        }).as('queueTrigger')

        // Create Session
        cy.contains('+ New Session').click()
        cy.get('input[placeholder="Operation Name"]').type(sessionTitle)
        cy.contains('button', 'Initialize').click()

        // Should start in empty state
        cy.contains('Initialize Tech Transfer', { timeout: 10000 }).should('be.visible')

        // Click UPLOAD BOM to start wizard flow
        cy.contains('UPLOAD BOM').closest('button').click({ force: true })

        // Debug: Check if we moved
        cy.contains('Process Sketch').should('not.exist')

        // Check for file selection button which is specific to BOM view
        cy.contains('SELECT FILE', { timeout: 10000 }).should('be.visible')

        // Upload file
        // Note: The input is inside a label that says SELECT FILE.
        // There are multiple file inputs, we target the one relevant to this view.
        // Or simply the first visible one.
        cy.get('input[type="file"]').selectFile({
            contents: Cypress.Buffer.from('mock excel content'),
            fileName: 'test_bom.xlsx',
            mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        }, { force: true })

        // 1. Verify Upload happened
        cy.wait('@uploadBlob')

        // 2. Verify Queue was triggered (should fail currently)
        cy.wait('@queueTrigger', { timeout: 5000 })

        // 3. Verify UI shows processing
        cy.contains('Initiating Batch Process...').should('be.visible')
    })
})
