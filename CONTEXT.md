# CONTEXT — Vocabulaire du domaine EcoLinga

> Fichier central du langage partagé entre toi et l'IA.
> Mis à jour en direct pendant les sessions `grill-with-docs`.
> Ne pas coupler aux détails d'implémentation — uniquement les termes métier.

---

## Glossaire

### School (école parente)
L'entité de plus haut niveau. Représente un groupe scolaire ou une organisation.
Peut posséder plusieurs SubSchools.
Ex : "Groupe Scolaire Saint-Joseph"

### SubSchool (filiale / établissement)
Une entité scolaire autonome rattachée à une School.
Unité d'isolation multi-tenant : toutes les données sont filtrées par `sub_school_id`.
Ex : "Saint-Joseph Gombe", "Saint-Joseph Limete"

### Worker
Tout membre du personnel d'une SubSchool.
Supertype de Teacher, Administrator, etc.
Possède un contrat, un salaire (Payroll), un planning (WorkerSchedule).

### Teacher (enseignant)
Un Worker avec un rôle pédagogique.
Enseigne des Subjects dans des Classrooms selon un Schedule.
Distinct d'un Administrator qui est aussi un Worker mais sans rôle pédagogique.

### Learner (élève)
Un individu inscrit dans une SubSchool, rattaché à une Classroom et un Level.
Possède un Parent, génère des Costs (frais de scolarité), des Grades, des Attendances.

### Classroom (classe)
Un groupe d'élèves (Learners) à un Level donné, dans une SubSchool.
Ex : "6ème A", "Terminal Scientifique"

### Level (niveau scolaire)
La position d'un Learner dans le cursus.
Défini par un LevelType (ex : Primaire, Secondaire, Maternelle).

### Schedule (emploi du temps)
L'ensemble des créneaux horaires d'une Classroom pour une période donnée.
Associe un Teacher, un Subject, une Classroom, des horaires.

### Exam (évaluation)
Une évaluation formelle (contrôle, examen trimestriel).
Produit des QuizResults et des Assessments.

### Assessment (bulletin)
Le résultat consolidé d'un Learner sur une période (trimestre).
Agrège les notes de tous les Exams de la période.
≠ Quiz qui est une évaluation légère et rapide.

### Cost (frais de scolarité)
La dette financière d'un Learner envers la SubSchool.
Distinct d'un Payment qui est le règlement d'un Cost.

### Payment (paiement)
Le règlement (partiel ou total) d'un ou plusieurs Costs par un Parent.
Peut être effectué via Mobile Money, espèces, ou virement.

### Mobile Money
Système de paiement mobile dominant en Afrique centrale.
Providers : Airtel Money, M-Pesa (Vodacom), Orange Money.
Prioritaire sur les paiements par carte bancaire.

### Offline Queue (file hors-ligne)
Liste des mutations (create, update, delete) effectuées quand `navigator.onLine === false`.
Rejouée automatiquement à la reconnexion.
Critique pour les environnements à connexion instable (RDC).

### Règle de document (Document Policy)
Ce qu'une School ou une SubSchool exige ou déclenche pour un type de document, à part de son modèle.
Une suite d'étapes choisies dans un catalogue fermé : vérifier avant l'émission ou la révocation (et refuser : frais impayés, notes manquantes…), ou agir après (publier sur le portail parent).
La règle de la SubSchool passe avant celle de la School ; sans règle, tout est permis.

### Outbox (actions à faire)
Les actions « après » d'une Règle de document, écrites avec le document et exécutées ensuite par un worker, avec nouvel essai en cas d'échec.
Une action n'est jamais perdue et ne bloque jamais l'émission.

### Trimestre
Période académique standard au Congo (3 trimestres par an).
≠ Semestre utilisé dans d'autres systèmes.
Les Assessments et les Payrolls sont calculés par trimestre.

---

## Termes à éviter (trop ambigus)

| Terme flou | Utiliser plutôt |
|------------|-----------------|
| "compte" | School ou SubSchool ou User selon le contexte |
| "utilisateur" | Préciser le rôle : Teacher, Parent, Learner, Admin |
| "note" | Grade (valeur) ou Assessment (bilan trimestriel) |
| "paiement" | Payment (règlement) ou Cost (dette) |
| "classe" | Classroom (groupe d'élèves) ou Level (niveau) |
