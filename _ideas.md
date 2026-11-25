# Post ideas

Backlog of upcoming posts, drawn from past work. Files starting with `_` are
ignored by Quarto, so this never ends up on the site.

Keep anything about current work at the level of patterns and lessons: no
internal names, IDs, numbers or team names.

Suggested order: #1 next (rides the momentum of "Upgrades on autopilot"),
then #5 for reach, with #12 as a quick win in between. One post a month.

## Series 1: Agents in production

1. **Writing skills that agents can actually follow**
   - Story: the Debian skill was too complicated, so we simplified it. Stop
     rules, graders, and resolving a skill before fetching it.
   - Why: "how to write Claude Code skills" / "agent skills best practices" is
     heavily searched; few posts come from running them across a fleet.

2. **Headless Claude Code in CI: running agents as GitHub Actions jobs**
   - Story: detectors that are sometimes scripts and sometimes a headless
     agent, with fixed-format outputs, timeouts and retries.
   - Why: practical and easy to search for; can include working code.

3. **Ephemeral environments as the gate for AI-written pull requests**
   - Story: "it compiles" isn't enough. Owners asked to merge PRs that failed
     validation; we kept validation as a hard gate.
   - Why: a clear position in the "can we trust AI PRs?" debate.

4. **Designing an MCP server for one job**
   - Story: two tools (resolve, fetch), progressive disclosure, why small MCP
     servers beat big ones.
   - Why: MCP content is growing fast; most of it is beginner tutorials.

## Series 2: Scale stories

5. **Handling 2 lakh concurrent users within seconds: surviving exam-day traffic spikes**
   - Story: ALLEN test platform: pre-warming, queues, backpressure, what broke
     first.
   - Why: sudden-spike scaling stories get shared widely; memorable number.

6. **Moving analytics from Redshift to ClickHouse: what we gained and what hurt**
   - Story: the 2.5TB backfill with PySpark and Airflow, and the migration plan.
   - Why: "Redshift vs ClickHouse" / "Redshift to ClickHouse migration" are
     high-intent searches.

7. **Splitting a 2TB database out of a monolith without downtime**
   - Story: Udaan service split: dual writes, backfill, cut-over.
   - Why: evergreen topic for senior engineers.

8. **Real-time payouts: building a settlement platform for millions of small businesses**
   - Story: idempotency, retries, reconciliation, and the async job system
     behind it.
   - Why: fintech engineering is a well-paid niche with few practitioner
     write-ups.

## Series 3: Architecture notes (shorter posts)

9. **RabbitMQ to Kafka: separating your API pods from your background work**
   - Story: queue consumers that ran inside the API pods, and the move to
     stream workers. Acks, dead-letter queues, one topic per stage.

10. **Change streams as an event source: publishing every database write without touching app code**
    - Story: the DocumentDB change-stream option we evaluated.

11. **Policies as data: treating platform rules like database rows**
    - Story: the policy document design (appliesTo, observed, desired, CEL) as
      a reusable pattern beyond upgrades.

## Refresh, not new

12. **From 780s to 3s: fixing slow Rails reports with database views**
    - Rewrite of "Rails + PostgreSQL views": stronger title, a benchmark
      chart, current tooling. Old posts with a good number in the title often
      rank fastest.
