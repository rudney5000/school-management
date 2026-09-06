workspace "School Management Infrastructure" "Runtime deployment architecture for local and production environments." {
    model {
        system = softwareSystem "School Management" "School management application." {
            frontend = container "Frontend" "React/Vite web or Tauri client." "React, Vite, Tauri"
            backend = container "Backend" "Express API and Socket.IO gateway." "Node.js, Express"
            postgres = container "PostgreSQL" "Transactional application database." "PostgreSQL"
            redis = container "Redis" "Cache and realtime adapter." "Redis"
            minio = container "MinIO" "S3-compatible object storage." "MinIO"
            livekit = container "LiveKit" "Media server for video calls." "LiveKit"
        }
        frontend -> backend "Calls" "HTTPS/WebSocket"
        backend -> postgres "Reads and writes" "SQL"
        backend -> redis "Caches and publishes" "Redis protocol"
        backend -> minio "Stores files" "S3 API"
        backend -> livekit "Creates sessions" "LiveKit API"
    }
    deploymentEnvironment "Docker Compose" {
        deploymentNode "Client device" "Browser or desktop workstation" {
            frontendInstance = containerInstance frontend
        }
        deploymentNode "Application host" "Docker host" {
            backendInstance = containerInstance backend
        }
        deploymentNode "Data services" "Docker Compose services" {
            postgresInstance = containerInstance postgres
            redisInstance = containerInstance redis
            minioInstance = containerInstance minio
        }
        deploymentNode "Media services" "Docker Compose service" {
            livekitInstance = containerInstance livekit
        }
    }
    views {
        deployment system "Docker Compose" infrastructure_deployment "Docker Compose deployment" {
            include *
            autoLayout
        }
        container system "infrastructure_containers" "Infrastructure containers" {
            include *
            autoLayout
        }
    }
    styles {
        element "Software System" { background "#1d3557" color "#ffffff" }
        element "Container" { background "#457b9d" color "#ffffff" }
    }
}
