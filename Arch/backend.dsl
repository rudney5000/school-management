workspace "School Management Backend" "Backend architecture for the school-management platform." {
    model {
        frontend = softwareSystem "Frontend applications" "React/Vite web and Tauri clients." "External"
        backend = softwareSystem "Backend API" "Express and TypeScript modular backend." {
            api = container "HTTP API" "Authentication, tenant access and domain endpoints." "Express, TypeScript"
            realtime = container "Realtime gateway" "Socket.IO connections, chat and live events." "Socket.IO"
            modules = container "Domain modules" "Schools, students, teachers, courses, exams, grades, attendance, payments, reports and schedules." "TypeScript"
            documents = container "Document services" "PDF generation, attachments and signatures." "React-PDF, S3 SDK"
            workers = container "Background workers" "Asynchronous document and notification processing." "Node.js"
            db = container "PostgreSQL" "Tenant-aware transactional data." "PostgreSQL, Drizzle ORM"
            cache = container "Redis" "Cache and Socket.IO adapter state." "Redis"
            storage = container "MinIO/S3" "Attachments and generated documents." "S3-compatible storage"
            livekit = container "LiveKit" "Video and audio session infrastructure." "LiveKit"

            httpMiddleware = component "HTTP middleware" "Helmet, CORS, compression, JSON parsing, logging and error handling." "Express middleware"
            routers = component "REST routers" "Routes under /api/auth, /api/students, /api/payments, /api/grades, /api/reports and other domains." "Express routers"
            services = component "Domain services" "Business rules for school, academic, attendance, payment, communication and document workflows." "TypeScript"
            databaseClient = component "Database client" "Drizzle ORM and postgres-js connection used by backend modules." "Drizzle ORM, postgres-js"
            socketServer = component "Socket.IO server" "Initializes realtime connections and Redis adapter integration." "Socket.IO"
            workerRunner = component "Worker runner" "Runs asynchronous jobs for documents and notifications." "Node.js"
        }
        sms = softwareSystem "Africa's Talking SMS" "Critical notification provider." "External"
        frontend -> api "Calls endpoints" "HTTPS/JSON"
        frontend -> realtime "Connects for live updates" "WebSocket"
        api -> modules "Routes validated requests" "In-process"
        api -> db "Reads and writes" "SQL"
        modules -> db "Persists domain data" "SQL"
        modules -> cache "Caches and coordinates" "Redis"
        realtime -> cache "Uses adapter state" "Redis"
        documents -> storage "Stores files" "S3 API"
        documents -> db "Stores document metadata" "SQL"
        workers -> documents "Processes document jobs" "In-process"
        modules -> livekit "Creates and manages sessions" "LiveKit API"
        modules -> sms "Sends critical notifications" "HTTPS API"

        api -> httpMiddleware "Applies request middleware" "In-process"
        httpMiddleware -> routers "Passes validated requests" "In-process"
        routers -> services "Invokes domain use cases" "In-process"
        services -> databaseClient "Reads and writes data" "In-process"
        services -> documents "Generates PDFs and handles files" "In-process"
        services -> cache "Uses cache and coordination state" "Redis"
        socketServer -> cache "Uses Redis adapter" "Redis"
        workerRunner -> services "Executes asynchronous jobs" "In-process"
        databaseClient -> db "Executes queries and migrations" "PostgreSQL protocol"
        socketServer -> realtime "Provides Socket.IO connections" "In-process"
    }
    views {
        systemContext backend "backend_context" "Backend context" {
            include *
            autoLayout
        }
        container backend "backend_containers" "Backend containers" {
            include *
            autoLayout
        }

        component api "backend_api_components" "HTTP API internals" {
            include *
            autoLayout
        }

        dynamic backend backend_request_flow "Backend request and service flow" {
            frontend -> api "1. Sends authenticated HTTP request"
            api -> httpMiddleware "2. Applies security and parsing middleware"
            httpMiddleware -> routers "3. Resolves /api route"
            routers -> services "4. Executes domain service"
            services -> databaseClient "5. Loads or persists data"
            databaseClient -> db "6. Executes SQL query"
            services -> cache "7. Reads or updates cache when needed"
            services -> documents "8. Generates document or attachment when needed"
            services -> sms "9. Sends notification when needed"
            autoLayout
        }
    }
    styles {
        element "Person" { background "#2d6a4f" color "#ffffff" }
        element "Software System" { background "#1d3557" color "#ffffff" }
        element "Container" { background "#457b9d" color "#ffffff" }
        element "External" { background "#6c757d" color "#ffffff" }
    }
}
