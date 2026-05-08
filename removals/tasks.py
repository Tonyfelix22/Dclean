"""Removals Celery tasks."""
from celery import shared_task
from django.utils import timezone
import logging

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3)
def submit_removal(self, request_id: str):
    """
    Submits a removal request via the appropriate method
    (email / web-form / api). This is a stub — real dispatch
    lives in services/removal_automator.py.
    """
    from .models import RemovalRequest, RemovalAttempt, RemovalLog

    try:
        req = RemovalRequest.objects.select_related(
            "match__source__removal_template"
        ).get(id=request_id)

        attempt_number = req.attempts.count() + 1
        attempt = RemovalAttempt.objects.create(
            request=req,
            attempt_number=attempt_number,
            method_used=req.method,
        )

        # TODO: call RemovalAutomator(req).dispatch()
        # Stub: mark as submitted
        attempt.is_success = True
        attempt.response_code = 200
        attempt.save(update_fields=["is_success", "response_code"])

        req.status = RemovalRequest.Status.SUBMITTED
        req.submitted_at = timezone.now()
        req.save(update_fields=["status", "submitted_at"])

        RemovalLog.objects.create(
            request=req,
            action=RemovalLog.Action.ATTEMPT_MADE,
            message=f"Attempt #{attempt_number} submitted via {req.method}.",
        )
    except RemovalRequest.DoesNotExist:
        logger.error(f"RemovalRequest {request_id} not found.")
    except Exception as exc:
        logger.exception(f"RemovalRequest {request_id} submission failed: {exc}")
        self.retry(exc=exc, countdown=300)


@shared_task
def check_removal_status(request_id: str):
    """Polls to verify whether a removal has been actioned by the site."""
    # TODO: Implement follow-up check logic
    logger.info(f"Checking removal status for {request_id}")


@shared_task
def escalate_removal(request_id: str):
    """Escalates a stuck removal request."""
    from .models import RemovalRequest, RemovalLog

    try:
        req = RemovalRequest.objects.get(id=request_id)
        req.status = RemovalRequest.Status.ESCALATED
        req.save(update_fields=["status"])
        RemovalLog.objects.create(
            request=req,
            action=RemovalLog.Action.ESCALATED,
            message="Request escalated due to no response.",
        )
    except RemovalRequest.DoesNotExist:
        logger.error(f"RemovalRequest {request_id} not found for escalation.")
