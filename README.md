Manual PR-based promotion
→ Developer opens PR dev→staging, staging→main
→ Values update + deploy
→ Best for controlled environments

Automated promotion
→ GitHub Actions auto opens PR from dev→staging
→ After tests pass
→ Can include quality gates

Argo Rollouts step-driven strategy
→ Canary/Blue-Green
→ Automated with metrics

🏗 Final Architecture We Will Build

Developer Push
     │
     ▼
GitHub Actions CI
     │
     ├── Build Docker Image
     ├── Push Image → DockerHub
     ├── Update GitOps repo (dev values.yaml)
     │
     ▼
ArgoCD detects change
     │
     ▼
Deploy to DEV namespace
     │
     ▼
GitHub Actions creates PR
dev  → staging
     │
     ▼
Merge PR
     │
     ▼
ArgoCD deploys to STAGING
     │
     ▼
GitHub Actions creates PR
staging → master
     │
     ▼
Merge PR
     │
     ▼
ArgoCD deploys to PROD

📁 FINAL REPOSITORY STRUCTURE (Industry Standard)
1️⃣ Application Repository (CI repo)
ecommerce-app
├── Dockerfile
├ ── .github
├    └── workflows
├        ├── docker-build.yml
├        └── promote.yml
└── app
    ├── assets
    │   └── test.txt
    ├── index.html
    ├── index3.html
    ├── package.json
    └── server.js
2️⃣ GitOps Repository (Deployment repo)
ecommerce-gitops
├── README.md
├── argocd
│   └── applicationset.yaml
├── charts
│   └── my-app
│       ├── Chart.yaml
│       ├── charts
│       ├── templates
│       │   ├── NOTES.txt
│       │   ├── _helpers.tpl
│       │   ├── deployment.yaml
│       │   ├── hpa.yaml
│       │   ├── ingress.yaml
│       │   ├── rollout-bluegreen.yaml
│       │   ├── rollout.yaml
│       │   ├── service-active.yaml
│       │   ├── service-preview.yaml
│       │   ├── service.yaml
│       │   ├── serviceaccount.yaml
│       │   └── tests
│       │       └── test-connection.yaml
│       └── values.yaml
├── environments
│   ├── dev
│   │   └── values.yaml
│   ├── prod
│   │   └── values.yaml
│   └── staging
│       └── values.yaml
└── k8s
    ├── argocd-image-updater-config.yaml
    ├── dockerhub-creds.yaml
    ├── git-creds.yaml
    ├── image-updater-rbac-fix.yaml
    ├── image-updater-rbac.yaml
    └── image-updater.yaml

🚀 Promotion Strategy (GitHub Actions)
When push to dev branch
Build image
Push image
Update gitops repo dev values.yaml
Create PR dev → staging

When staging PR merged
Create PR staging  → master

When master PR merged
Deploy to Prod

Application Repo : ecommerce-app
GitOps Repo      : ecommerce-gitops
Docker Image     : lehardocker/ecommerce-app

Promotion Workflow (GitHub Actions)
create promote.yaml 

6️⃣ What You Built So Far 🚀

Developer Push
     ↓
GitHub Actions CI
     ↓
DockerHub Image
     ↓
Update GitOps Repo
     ↓
ArgoCD Deploy
     ↓
Promotion via PR

🔹 Best Practice for Syncing Helm Charts & K8s Manifests
1. 	Single Source of Truth for Templates
2. 	Merge Dev → Staging → Master
3. 	Promotion Workflow Handles Values
4. 	Avoid Drift
   

🔹 Recommended Branch Strategy
dev branch
 ├─ Helm charts (latest)
 ├─ k8s manifests (latest)
 └─ values.yaml (auto-updated by Image Updater)

staging branch
 ├─ Helm charts (merged from dev)
 ├─ k8s manifests (merged from dev)
 └─ values.yaml (updated by promote.yml)

master branch
 ├─ Helm charts (merged from staging)
 ├─ k8s manifests (merged from staging)
 └─ values.yaml (updated by promote.yml)

 

