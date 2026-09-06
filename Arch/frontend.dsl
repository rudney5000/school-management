workspace "School Management Frontend" "Frontend architecture for the school-management platform." {
    model {
        staff = person "School staff" "Administrators, teachers and accounting staff."
        parent = person "Parent or guardian" "Parent or guardian using the platform."
        frontend = softwareSystem "Frontend applications" "React/Vite web client with optional Tauri desktop shell." {
            web = container "React web application" "Feature-Sliced user interface, routing, forms and offline cache." "React 19, TypeScript, Vite"
            desktop = container "Tauri desktop shell" "Desktop packaging and native capabilities." "Tauri 2, Rust"
            state = container "Client state and offline sync" "TanStack Query persistence and Redux mutation queue." "TanStack Query, Redux Toolkit, IndexedDB"
            realtime = container "Realtime client" "Live updates, chat and call signaling." "Socket.IO client, LiveKit client"
        }
        backend = softwareSystem "School Management Backend" "Backend API and realtime services." "External"
        staff -> web "Uses" "HTTPS"
        parent -> web "Uses" "HTTPS"
        web -> backend "Calls API" "HTTPS/JSON"
        web -> state "Reads and updates local state" "In-process"
        web -> realtime "Receives live events" "WebSocket/WebRTC"
        desktop -> web "Hosts UI" "Tauri IPC"
        state -> backend "Synchronizes queued mutations" "HTTPS"
    }
    views {
        systemContext frontend "frontend_context" "Frontend context" {
            include *
            autoLayout
        }
        container frontend "frontend_containers" "Frontend containers" {
            include *
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
