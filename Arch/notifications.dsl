// Structurizr DSL — packages/notifications : authentification multi-identifiants
// (email, téléphone, username + OTP SMS) et diffusion de notifications SMS.
// Package interne au monorepo school-management (voir ADR-008) : consommé
// uniquement par `backend`, ne dépend pas de son schéma Drizzle (interface
// NotificationStore/IdentifierStore injectée). ADR-005, ADR-006, ADR-007, ADR-008.
workspace "School Management Notifications" "Package packages/notifications : auth multi-identifiants + OTP, et pipeline SMS." {
    model {
        user = person "Utilisateur" "Teacher, student, director, parent, worker, admin — tout rôle de la plateforme."
        schoolAdmin = person "Admin / director" "Provisionne les comptes et supervise l'état des passerelles SMS."

        backend = softwareSystem "School Management Backend" "API Express qui importe packages/notifications (backend -> package, jamais l'inverse)." "External"
        smsGateway = softwareSystem "android-sms-gateway — Cloud" "Compte cloud partagé (api.sms-gate.app), un deviceId par téléphone-passerelle d'école, SIM opérateur de l'école." "External"

        notifications = softwareSystem "packages/notifications" "Package interne : auth multi-identifiants + OTP, dispatch et suivi des SMS." {
            authService = container "Auth service" "Résout email/téléphone/username via IdentifierStore, vérifie le mot de passe, OTP, émission JWT, provisioning." "TypeScript, bcrypt, jsonwebtoken"
            notificationService = container "Notification service" "Crée les notifications, résout le deviceId de la sous-école, choisit le stream transactionnel ou bulk." "TypeScript"
            worker = container "SMS worker" "Consumer group Redis Streams, appelle la gateway, retry/backoff, XACK au dispatch. In-process avec l'API au pilote (ADR-008)." "Node.js"
            webhookHandler = container "Webhook handler" "Vérifie la signature HMAC-SHA256, retrouve la notification via deviceId + external_message_id, met à jour le statut." "Express router monté par backend"
            reconciliationJob = container "Reconciliation job" "Repli périodique : poll GET /messages/{id} pour les notifications 'sending' sans webhook après ~15 min." "Node.js, cron"
            otpCache = container "OTP cache" "Codes à 6 chiffres, TTL 5 min, compteur de tentatives." "Redis"
            streams = container "Redis Streams" "sms:otp:<deviceId> (transactionnel) et sms:out:<deviceId> (bulk), consumer groups, PEL, XAUTOCLAIM." "Redis"
            store = container "NotificationStore / IdentifierStore" "Interface injectée par backend — le package ne dépend pas de backend/db directement (ADR-008)." "TypeScript interface"
        }

        user -> backend "Se connecte : identifiant (email/téléphone/username) + mot de passe, ou téléphone + OTP" "HTTPS"
        schoolAdmin -> backend "Crée un compte (identifiant de provisioning envoyé par SMS/email), consulte l'état des passerelles" "HTTPS"

        backend -> notifications "Importe le package pour l'auth et l'envoi SMS" "Workspace package, in-process"
        backend -> store "Implémente l'interface (accès réel à Postgres : users, user_identifiers, notifications, sms_gateway_devices)" "In-process"

        authService -> store "Lit/écrit users et user_identifiers, vérifie le mot de passe" "Interface injectée"
        authService -> otpCache "Écrit/lit le code OTP" "Redis"
        authService -> notificationService "Déclenche l'envoi du code OTP ou du provisioning" "In-process"

        notificationService -> store "Crée la notification, status=queued" "Interface injectée"
        notificationService -> streams "XADD sur le stream du device concerné" "Redis"

        worker -> streams "XREADGROUP ; XACK une fois l'envoi accepté par la gateway" "Redis"
        worker -> smsGateway "POST /messages { deviceId, priority, ttl }" "HTTPS/JSON"
        worker -> store "status=sending, stocke external_message_id" "Interface injectée"

        smsGateway -> webhookHandler "sms:sent / sms:delivered / sms:failed (X-Signature, X-Timestamp)" "HTTPS webhook"
        webhookHandler -> store "status=sent / delivered / failed" "Interface injectée"

        reconciliationJob -> store "Lit les notifications 'sending' depuis trop longtemps" "Interface injectée"
        reconciliationJob -> smsGateway "GET /messages/{id} (repli)" "HTTPS"
        reconciliationJob -> store "Corrige le statut si la gateway a déjà une réponse" "Interface injectée"
    }

    views {
        systemContext notifications notifications_context "Contexte" {
            include *
            autoLayout
        }

        container notifications notifications_containers "Conteneurs" {
            include *
            autoLayout
        }

        dynamic notifications otp_login_flow "Connexion par OTP" {
            user -> backend "1. POST /auth/otp/request { identifiant }"
            backend -> authService "2. Délègue au package (in-process)"
            authService -> otpCache "3. Génère et stocke le code (TTL 5 min)"
            authService -> notificationService "4. Demande l'envoi du code"
            notificationService -> store "5. Crée la notification, status=queued"
            notificationService -> streams "6. XADD sur sms:otp:<deviceId>, priority ≥100"
            worker -> streams "7. XREADGROUP"
            worker -> smsGateway "8. POST /messages"
            user -> backend "9. POST /auth/otp/verify { téléphone, code }"
            authService -> otpCache "10. Vérifie le code, le supprime si correct"
            autoLayout
        }

        dynamic notifications sms_send_flow "Envoi d'un SMS et confirmation de statut" {
            notificationService -> store "1. Crée la notification, status=queued"
            notificationService -> streams "2. XADD"
            worker -> streams "3. XREADGROUP"
            worker -> smsGateway "4. POST /messages { deviceId }"
            worker -> store "5. status=sending, external_message_id"
            smsGateway -> webhookHandler "6. Webhook sms:sent / delivered / failed"
            webhookHandler -> store "7. Met à jour le statut final"
            reconciliationJob -> smsGateway "8. (repli) GET /messages/{id} si pas de webhook après ~15 min"
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
