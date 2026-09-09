# Jobs API

`POST /api/v1/jobs/diagnostic` is a protected infrastructure example. It requires the `role:update` permission and an `Idempotency-Key` header. A first request returns `202`; a duplicate key returns the existing Job ID with `200` and does not enqueue a second job.

The API process never executes the task inline. Start `npm run worker` separately to consume the `system` queue. The optional scheduler is a separate singleton process started with `npm run scheduler` and `SCHEDULER_ENABLED=true`.
