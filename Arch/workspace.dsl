// Structurizr DSL architecture for the school-management monorepo.
workspace "School Management Architecture" "C4 architecture for the multi-school SaaS platform." {
    model {
        schoolStaff = person "School staff" "Administrators, teachers and accounting staff using the platform."
        parent = person "Parent or guardian" "Parent or guardian consulting student information and payments."
        platformOperator = person "Platform operator" "Operator responsible for platform administration."
        smsProvider = softwareSystem "Africa's Talking SMS" "External SMS provider for critical notifications." "External"

        schoolManagement = softwareSystem "School Management" "Multi-tenant, offline-first school management platform." {
            webApp = container "Web application" "Browser application for school operations and reporting." "React 19, TypeScript, Vite"
            desktopShell = container "Desktop shell" "Optional desktop packaging and native integration." "Tauri 2, Rust"
            api = container "Backend API" "Authenticated HTTP and real-time API for school workflows." "Node.js, TypeScript, Express"
            realtime = container "Realtime gateway" "Socket.IO gateway for live updates and chat events." "Socket.IO"
            pdfTemplates = container "PDF templates" "Shared React-PDF templates used for generated documents." "TypeScript, React-PDF"
            postgres = container "PostgreSQL" "Tenant-aware transactional data and academic records." "PostgreSQL, Drizzle ORM"
            redis = container "Redis" "Cache, transient state and Socket.IO adapter data." "Redis"
            objectStorage = container "Object storage" "Attachments and generated files in an S3-compatible bucket." "MinIO, S3 API"
            livekit = container "LiveKit" "Audio/video session infrastructure for live classes and calls." "LiveKit, WebRTC"

            auth = component "Authentication and authorization" "JWT authentication, roles and tenant access control." "TypeScript"
            academic = component "Academic management" "Schools, classes, courses, periods, schedules, students and teachers." "TypeScript"
            assessment = component "Assessment and attendance" "Exams, grades, attendance and academic reports." "TypeScript"
            finance = component "Payments and reports" "Payment tracking, receipts and reporting workflows." "TypeScript"
            communication = component "Communication" "Chat, events, notifications and video call coordination." "TypeScript"
            documents = component "Documents and signatures" "PDF generation, attachments and digital signatures." "TypeScript"
            sync = component "Offline synchronization" "Conflict-aware synchronization for offline-first clients." "TypeScript"
        }

        schoolStaff -> schoolManagement "Manages school operations" "HTTPS"
        parent -> schoolManagement "Views student information and payments" "HTTPS"
        platformOperator -> schoolManagement "Administers tenants and platform configuration" "HTTPS"
        schoolStaff -> webApp "Uses" "HTTPS"
        parent -> webApp "Uses" "HTTPS"
        platformOperator -> webApp "Uses" "HTTPS"
        webApp -> api "Calls REST API" "HTTPS/JSON"
        webApp -> realtime "Receives live updates" "WebSocket"
        webApp -> livekit "Joins live sessions" "WebRTC"
        desktopShell -> webApp "Hosts the application UI" "Tauri IPC"
        api -> realtime "Publishes events" "Internal calls"
        api -> postgres "Reads and writes tenant data" "SQL"
        api -> redis "Caches data and coordinates sockets" "Redis protocol"
        api -> objectStorage "Stores and retrieves documents" "S3 API"
        api -> livekit "Creates rooms and access tokens" "LiveKit API"
        api -> pdfTemplates "Renders school documents" "In-process import"
        api -> smsProvider "Sends critical notifications" "HTTPS API"
        auth -> postgres "Reads users and tenant access" "SQL"
        academic -> postgres "Reads and writes academic data" "SQL"
        assessment -> postgres "Reads and writes grades and attendance" "SQL"
        finance -> postgres "Reads and writes payment data" "SQL"
        communication -> redis "Uses transient and realtime state" "Redis"
        communication -> livekit "Coordinates video sessions" "LiveKit API"
        documents -> pdfTemplates "Uses shared templates" "In-process import"
        documents -> objectStorage "Stores generated documents" "S3 API"
        sync -> postgres "Persists synchronized mutations" "SQL"
        sync -> redis "Uses synchronization state" "Redis"
    }

    deploymentEnvironment "Docker Compose" {
        deploymentNode "Application host" "Docker host" {
            deploymentNode "Frontend runtime" "Browser or Tauri client" {
                webAppInstance = containerInstance webApp
                desktopShellInstance = containerInstance desktopShell
            }
            apiInstance = containerInstance api
            realtimeInstance = containerInstance realtime
            pdfTemplatesInstance = containerInstance pdfTemplates
        }
        deploymentNode "Data services" "Docker Compose services" {
            postgresInstance = containerInstance postgres
            redisInstance = containerInstance redis
            objectStorageInstance = containerInstance objectStorage
        }
        deploymentNode "Media services" "Docker Compose service" {
            livekitInstance = containerInstance livekit
        }
    }

    views {
        systemContext schoolManagement school_management_context "System Context" {
            include *
            autoLayout
        }

        container schoolManagement school_management_containers "Containers" {
            include *
            autoLayout
        }

        component api backend_components "Backend Components" {
            include *
            autoLayout
        }

        dynamic schoolManagement school_management_flow "Primary user flow" {
            schoolStaff -> webApp "Opens the application"
            webApp -> api "Authenticates and calls an API"
            api -> postgres "Loads tenant data"
            api -> redis "Caches or publishes state"
            autoLayout
        }

        deployment schoolManagement "Docker Compose" school_management_deployment "Deployment" {
            include *
            autoLayout
        }
    }

    styles {
        element "Person" {
            background "#2d6a4f"
            color "#ffffff"
        }
        element "Software System" {
            background "#1d3557"
            color "#ffffff"
        }
        element "Container" {
            background "#457b9d"
            color "#ffffff"
        }
        element "Component" {
            background "#e76f51"
            color "#ffffff"
        }
        element "External" {
            background "#6c757d"
            color "#ffffff"
        }
    }
}
