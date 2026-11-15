# ma-ops knowledge

This document covers the skills of the `ma-ops` module: what each one gives the user and when to recommend it. The module's agents (Alex, Yael, Amit and Gadi, group `ops`) are listed in `roster.toml` and are skills too; each carries the workflows of its domain on its menu. Every workflow reads epics and stories through the ticket tree (`tickets.py`, from `bmad-agent-po`) and files defects by asking `bmad-agent-po` to file a bug; none reads or writes a sprint tracker file.

## Agents

- `ma-agent-sre`: Alex, the Site Reliability Engineer: keeps systems available, reliable and fast with Kubernetes, Prometheus and Grafana, and runs the SRE workflows of the ma-ops module. Recommend it when the user asks for Alex or the SRE, or names one of the `sre-*` workflows below.
- `ma-agent-cyber`: Yael, the Cyber Analyst: assesses vulnerabilities, models threats and hardens systems against OWASP, CWE/SANS, CIS and NIST guidance, and runs the cyber workflows of the ma-ops module. Recommend it when the user asks for Yael or the security analyst, or names one of the `cyber-*` workflows or `self-signed-cert` below.
- `ma-agent-devops`: Amit, the DevOps Engineer: automates CI/CD pipelines and infrastructure as code with Terraform, Ansible and Helm, shift-left and GitOps by default, and runs the DevOps, Docker and epic-orchestration workflows of the ma-ops module. Recommend it when the user asks for Amit or the DevOps engineer, or names one of the `devops-*` or Docker workflows or `ma-ops-dev-epic` below.
- `ma-agent-sqa`: Gadi, the Software Quality Assurance and Standards Expert: audits quality against IEEE and ISO/IEC standards and writes MIL-STD-498 documentation, and runs the SQA and MIL-STD-498 workflows of the ma-ops module. Recommend it when the user asks for Gadi or the SQA agent, or names one of the `sqa-*` or `mil498-*` workflows below.

## SRE workflows

- `sre-check-deployment-status`: Alex's gate on one deployment: replicas, rollout, pods and events in one report. Recommend it when the user asks to check a deployment, its rollout or its status.
- `sre-check-secrets`: Alex's secret triage: is the Secret there, mounted, readable, and complete, without showing values. Recommend it when the user says check secrets or debug secrets.
- `sre-check-system-status`: Alex's cluster-wide health check across Kubernetes, Docker and Podman hosts. Recommend it when the user asks for system status, a health check or what is wrong with the cluster.
- `sre-day-2-ops`: Alex's maintenance programme: upgrades, rotation, backups, capacity, housekeeping. Recommend it when the user asks about maintenance, upgrades, rotation or keeping a cluster healthy over time.
- `sre-deployment-strategies`: Alex's guide to Blue-Green, Canary and Rolling Updates, with rollback for each. Recommend it when the user asks how to roll out a change safely or which deployment strategy to use.
- `sre-fix-deployments`: Alex's fix loop for failing deployments: diagnose from events and logs, then the smallest fix. Recommend it when the user says fix deployments or a deployment is failing.
- `sre-gitops-status`: Alex's drift check between Git and the cluster with ArgoCD or Flux. Recommend it when the user asks about sync state, drift or GitOps health.

## Cyber workflows

- `cyber-generate-certs`: Yael's certificate workflow over the `self-signed-cert` scripts: CA, leaf certs, trust-store import, rotation. Recommend it when the user asks to generate certificates or certs.
- `cyber-immunity-estimation`: Yael's posture rating: immunity against the common attack vectors, area by area. Recommend it when the user asks how secure the system is or for a security posture assessment.
- `cyber-security-audit`: Yael's full audit of infrastructure and application configuration, findings by severity. Recommend it when the user asks for a security audit or a deep audit of the codebase.
- `cyber-vault-secrets`: Yael's HashiCorp Vault operations: secrets, policies, auth methods. Recommend it when the user asks to store, read or rotate a secret in Vault or to manage Vault policies.
- `cyber-verify-docker-users`: Yael's image user audit: non-root, least privilege, OpenShift-ready, through `docker-hardening-verification`. Recommend it when the user asks to verify docker users or audit an image's user.
- `cyber-verify-image-signature`: Yael's supply-chain check: the image signature verified by digest with cosign. Recommend it when the user asks to verify an image signature or check image provenance.
- `cyber-vulnerability-scan`: Yael's scan orchestration across dependencies, images, infrastructure and code, with triage. Recommend it when the user asks for a vulnerability scan or a security scan.

## DevOps workflows

- `devops-configure-infrastructure`: Amit's infrastructure-as-code setup of namespaces, ingress, storage, networking and policies. Recommend it when the user asks to configure or set up infrastructure.
- `devops-disconnected-deployment`: Amit's air-gapped delivery: images, charts and dependencies packaged, moved and installed offline. Recommend it when the user asks about an air-gapped, offline or disconnected deployment.
- `devops-docker-compose-setup`: Amit's Compose setup for development and on-prem: services, networks, volumes, health checks. Recommend it when the user asks to set up or improve a docker-compose project.
- `devops-manage-helm`: Amit's Helm work: charts, umbrellas, values, templates, lint and release. Recommend it when the user asks to create, update or manage Helm charts.
- `devops-sign-docker-image`: Amit's signing workflow over `docker-image-signing`: digest, certificate, cosign, verify. Recommend it when the user asks to sign a docker image.

## SQA workflows

- `sqa-audit`: Gadi's project audit across five dimensions (traceability, alignment, process, delivery flow, release state) with PASS / WARNING / FAIL findings and a saved report. Recommend it when the user says audit, audit project or run audit.
- `sqa-ieee12207`: Gadi's IEEE/ISO/IEC 12207 lifecycle compliance report, per process area. Recommend it when the user says ieee, 12207 or lifecycle compliance.
- `sqa-requirements-quality`: Gadi's requirements audit against 14 quality criteria, with a per-requirement table and a score. Recommend it when the user says requirements quality, audit requirements or requirements audit.

## MIL-STD-498 workflows

- `mil498-ocd`: Gadi's MIL-STD-498 Operational Concept Description (DI-IPSC-81430). Recommend it when the user says generate OCD or operational concept description.
- `mil498-requirement-quality`: Gadi's 14-criteria requirements check for any requirements document or section. Recommend it when the user asks to review, verify or improve requirements quality.
- `mil498-sdd`: Gadi's MIL-STD-498 Software Design Description (DI-IPSC-81435) for one CSCI. Recommend it when the user says generate SDD or software design description.
- `mil498-sdp`: Gadi's MIL-STD-498 Software Development Plan (DI-IPSC-81427). Recommend it when the user says generate SDP or software development plan.
- `mil498-srs`: Gadi's MIL-STD-498 Software Requirements Specification (DI-IPSC-81433) for one CSCI. Recommend it when the user says generate SRS or software requirements specification.
- `mil498-ssdd`: Gadi's MIL-STD-498 System/Subsystem Design Description (DI-IPSC-81432), CSCI decomposition included. Recommend it when the user says generate SSDD or system design description.
- `mil498-sss`: Gadi's MIL-STD-498 System/Subsystem Specification (DI-IPSC-81431). Recommend it when the user says generate SSS or system specification.
- `mil498-std`: Gadi's MIL-STD-498 Software Test Description (DI-IPSC-81439), test cases traced to the SRS. Recommend it when the user says generate STD or software test description.

## Docker and certificate skills

- `create-hardened-docker-skill`: Amit's hardened Docker set: Dockerfile, compose, nginx, dockerignore and deployment docs per CIS / OWASP / NIST. Recommend it when the user asks for a hardened Dockerfile or a secure Docker setup.
- `docker-hardening-verification`: the image hardening audit script and its rules: non-root, least privilege, OpenShift compliance. Recommend it when the user asks to verify, audit or check the hardening of an image.
- `docker-image-signing`: the cosign signing script and its rules: sign by digest, verify after signing, keep keys secret. Recommend it when the user asks to sign an image or set up image signing.
- `verify-hardened-docker-skill`: Amit's verification suite for Docker configurations: Dockerfile, vulnerabilities, secrets, runtime security. Recommend it when the user asks to verify or audit a Docker configuration for hardening.
- `self-signed-cert`: the OpenSSL certificate scripts: Root CA, signed and standalone certificates with SANs. Recommend it when the user asks for a self-signed certificate or an internal CA.

## Epic orchestration

- `ma-ops-dev-epic`: orchestrates one epic of the ticket tree end to end, story by story: Sofia (`bmad-agent-po`) starts and completes each story so the configured store moves its card, `bmad-build` or `bmad-build-auto` builds it, `bmad-code-review`, `bmad-review` and `bmad-walkthrough` review it, and an epic-level review gate ends the run. It ships `scripts/migrate_v6_backlog.py`, the script of this module's `migration-1.toml` (3.x tracking data into the ticket tree). Recommend it when the user asks to run, develop or orchestrate a whole epic, or `bmad migrate` reaches the `ma-ops` migration.
