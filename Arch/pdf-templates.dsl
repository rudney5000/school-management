workspace "School Management PDF Templates" "Shared PDF rendering package architecture." {
    model {
        backend = softwareSystem "School Management Backend" "API that consumes the shared package." "External"
        frontend = softwareSystem "School Management Frontend" "Client that shares PDF types and templates." "External"
        templates = softwareSystem "PDF templates package" "Workspace package for reusable school document templates." {
            components = container "React-PDF templates" "Reusable receipts, reports, signatures and school document layouts." "React, @react-pdf/renderer"
            types = container "Document types" "Shared TypeScript models and rendering inputs." "TypeScript"
        }
        backend -> templates "Imports templates for server-side PDF generation" "Workspace package"
        frontend -> templates "Shares document models and renderers" "Workspace package"
        components -> types "Uses rendering types" "In-process"
    }
    views {
        systemContext templates "pdf_templates_context" "PDF templates context" {
            include *
            autoLayout
        }
        container templates "pdf_templates_containers" "PDF templates containers" {
            include *
            autoLayout
        }
    }
    styles {
        element "Software System" { background "#1d3557" color "#ffffff" }
        element "Container" { background "#e76f51" color "#ffffff" }
        element "External" { background "#6c757d" color "#ffffff" }
    }
}
