// Structurizr DSL — Authentification par téléphone et notifications SMS.
// Complète workspace.dsl/backend.dsl (mis à jour pour remplacer Africa's Talking
// par android-sms-gateway) avec le détail de ce sous-système : ADR-005, ADR-006, ADR-007.
workspace "School Management Notifications" "Authentification par téléphone (mot de passe + OTP) et diffusion de notifications SMS." {
    model {
        user = person "Utilisateur" "Teacher, student, director, parent, worker, admin — tout rôle de la plateforme."
        schoolAdmin = person "Admin / director" "Provisionne les comptes et supervise l'état des passerelles SMS."

        smsGateway = softwareSystem "android-sms-gateway — Cloud" "Compte cloud partagé (api.sms-gate.app), un deviceId par téléphone-passerelle d'école, SIM opérateur de l'école." "External"

        notifications = softwareSystem "School Management — Notifications" "Auth par téléphone et pipeline d'envoi/suivi des SMS." {
            authService = container "Auth service" "Login email/téléphone + mot de passe, demande et vérification d'OTP, émission JWT, provisioning avec mot de passe temporaire." "Express, TypeScript, bcrypt, jsonwebtoken"
            notificationService = container "Notification service" "Crée les notifications, résout le deviceId de la sous-école, choisit le stream transactionnel ou bulk." "TypeScript"
            worker = container "SMS worker" "Consumer group Redis Streams, appelle la gateway, retry/backoff, XACK au dispatch." "Node.js"
            webhookHandler = container "Webhook handler" "Vérifie la signature HMAC-SHA256, retrouve la notification via deviceId + external_message_id, met à jour le statut." "Express"
            reconciliationJob = container "Reconciliation job" "Repli périodique : poll GET /messages/{id} pour les notifications 'sending' sans webhook après ~15 min." "Node.js, cron"
            otpCache = container "OTP cache" "Codes à 6 chiffres, TTL 5 min, compteur de tentatives." "Redis"
            streams = container "Redis Streams" "sms:otp:<deviceId> (transactionnel) et sms:out:<deviceId> (bulk), consumer groups, PEL, XAUTOCLAIM." "Redis"
            db = container "PostgreSQL" "users (phone, password, password_is_temporary), notifications, sms_gateway_devices." "PostgreSQL, Drizzle ORM"
        }

        user -> authService "Se connecte : email/téléphone + mot de passe, ou téléphone + OTP" "HTTPS"
        schoolAdmin -> authService "Crée un compte (mot de passe temporaire envoyé par SMS)" "HTTPS"
        schoolAdmin -> db "Consulte l'état des passerelles (sms_gateway_devices.last_seen_at)" "SQL"

        authService -> db "Lit/écrit users, vérifie le mot de passe" "SQL"
        authService -> otpCache "Écrit/lit le code OTP" "Redis"
        authService -> notificationService "Déclenche l'envoi du code OTP ou du mot de passe temporaire" "In-process"

        notificationService -> db "Crée la notification, status=queued" "SQL"
        notificationService -> streams "XADD sur le stream du device concerné" "Redis"

        worker -> streams "XREADGROUP ; XACK une fois l'envoi accepté par la gateway" "Redis"
        worker -> smsGateway "POST /messages { deviceId, priority, ttl }" "HTTPS/JSON"
        worker -> db "status=sending, stocke external_message_id" "SQL"

        smsGateway -> webhookHandler "sms:sent / sms:delivered / sms:failed (X-Signature, X-Timestamp)" "HTTPS webhook"
        webhookHandler -> db "status=sent / delivered / failed" "SQL"

        reconciliationJob -> db "Lit les notifications 'sending' depuis trop longtemps" "SQL"
        reconciliationJob -> smsGateway "GET /messages/{id} (repli)" "HTTPS"
        reconciliationJob -> db "Corrige le statut si la gateway a déjà une réponse" "SQL"
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
            user -> authService "1. POST /auth/otp/request { phone }"
            authService -> otpCache "2. Génère et stocke le code (TTL 5 min)"
            authService -> notificationService "3. Demande l'envoi du code"
            notificationService -> db "4. Crée la notification, status=queued"
            notificationService -> streams "5. XADD sur sms:otp:<deviceId>, priority ≥100"
            worker -> streams "6. XREADGROUP"
            worker -> smsGateway "7. POST /messages"
            user -> authService "8. POST /auth/otp/verify { phone, code }"
            authService -> otpCache "9. Vérifie le code, le supprime si correct"
            autoLayout
        }

        dynamic notifications sms_send_flow "Envoi d'un SMS et confirmation de statut" {
            notificationService -> db "1. Crée la notification, status=queued"
            notificationService -> streams "2. XADD"
            worker -> streams "3. XREADGROUP"
            worker -> smsGateway "4. POST /messages { deviceId }"
            worker -> db "5. status=sending, external_message_id"
            smsGateway -> webhookHandler "6. Webhook sms:sent / delivered / failed"
            webhookHandler -> db "7. Met à jour le statut final"
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
